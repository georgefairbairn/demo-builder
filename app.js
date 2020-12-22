const { App } = require("@slack/bolt");
const axios = require("axios");

// initialize env variables
const dotenv = require("dotenv");
dotenv.config();

// db
const { storeAuth, fetchAuth } = require("./db/helpers");

// blocks
const {
  app_home,
  app_home_loading,
  app_home_not_authed,
} = require("./blocks/home");
const { config, confirmDelete } = require("./blocks/modals");

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
});

const apiCall = async (method, requestUrl, auth) => {
  try {
    const config = {
      method,
      url: `${process.env.API_BASE_URL}${requestUrl}`,
      headers: {
        Cookie: `XSRF-TOKEN=${auth.token}; SESSION=${auth.cookie}`,
      },
    };

    const { data } = await axios(config);
    return data;
  } catch (error) {
    if (
      error.response &&
      error.response.data &&
      error.response.data.error_code === "unauthorised"
    ) {
      return [];
    }
    console.error(error);
  }
};

const fetchStories = async (auth) => {
  if (auth.token && auth.cookie) {
    const orgs = await apiCall("get", "slackpoint0/orgs/list", auth);
    const workspaces = await apiCall(
      "get",
      "slackpoint0/workspaces/list",
      auth
    );
    const stories = await apiCall("get", "storybuilder/conversations", auth);

    const storiesBlock = stories.map((s) => {
      const workspace = workspaces.find(
        (workspace) => workspace.uid === s.workspace_uid
      );
      return {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${s.description}*\n${s.conversations_actions.length} messages in <#${s.conversations_actions[0].channel}>\n_Workspace: <slack://open?team=${workspace.slack_id}\|${workspace.name}>_`,
        },
        accessory: {
          type: "overflow",
          action_id: "overflow",
          options: [
            {
              text: {
                type: "plain_text",
                text: ":slack: - Load story in Slack",
                emoji: true,
              },
              value: JSON.stringify({ type: "load_in_slack", storyId: s.id }),
            },
            {
              text: {
                type: "plain_text",
                text: ":wastebasket: - Delete story",
                emoji: true,
              },
              value: JSON.stringify({ type: "delete_story", storyId: s.id }),
            },
          ],
        },
      };
    });
    return storiesBlock;
  }
};

app.event("app_home_opened", async ({ body, context, event, logger }) => {
  try {
    const id = body.enterprise_id || body.team_id;
    const auth = await fetchAuth(id);

    let stories = [];
    if (auth.cookie && auth.token) {
      stories = await fetchStories(auth);
    }

    await app.client.views.publish({
      token: context.botToken,
      user_id: event.user,
      view: app_home(auth, stories),
    });
  } catch (error) {
    logger.error(error);
  }
});

app.action("reload_stories", async ({ ack, body, context, logger }) => {
  try {
    await ack();
    const id = body.is_enterprise_install ? body.enterprise.id : body.team.id;
    const auth = await fetchAuth(id);
    const storiesBlock = await fetchStories(auth);

    return await app.client.views.publish({
      token: context.botToken,
      user_id: body.user.id,
      view: app_home(auth, storiesBlock),
    });
  } catch (error) {
    logger.error(error);
  }
});

app.action("overflow", async ({ ack, action, body, context, logger }) => {
  try {
    await ack();
    const id = body.is_enterprise_install ? body.enterprise.id : body.team.id;
    const auth = await fetchAuth(id);

    const selectedOption = JSON.parse(action.selected_option.value);

    if (selectedOption.type === "delete_story") {
      return await app.client.views.open({
        token: context.botToken,
        trigger_id: body.trigger_id,
        view: confirmDelete(selectedOption.storyId),
      });
    }

    await apiCall(
      "get",
      `storybuilder/conversation/send-to-slack?conversation_id=${selectedOption.storyId}`,
      auth
    );
  } catch (error) {
    logger.error(error);
  }
});

app.view("delete_confirmed", async ({ ack, body, context, logger, view }) => {
  try {
    await ack();
    const id = body.is_enterprise_install ? body.enterprise.id : body.team.id;
    const auth = await fetchAuth(id);
    await apiCall(
      "delete",
      `storybuilder/conversation/${view.private_metadata}`,
      auth
    );

    const storiesBlock = await fetchStories(auth);

    return await app.client.views.publish({
      token: context.botToken,
      user_id: body.user.id,
      view: app_home(auth, storiesBlock),
    });
  } catch (error) {
    logger.error(error);
  }
});

app.action("load_in_slack", async ({ ack, action, body, logger }) => {
  try {
    await ack();
    const id = body.is_enterprise_install ? body.enterprise.id : body.team.id;
    const auth = await fetchAuth(id);
    await apiCall(
      "get",
      `storybuilder/conversation/send-to-slack?conversation_id=${action.value}`,
      auth
    );
  } catch (error) {
    logger.error(error);
  }
});

app.action("edit_config", async ({ ack, body, context, logger }) => {
  try {
    await ack();
    const id = body.is_enterprise_install ? body.enterprise.id : body.team.id;
    const existingAuth = await fetchAuth(id);

    await app.client.views.open({
      token: context.botToken,
      trigger_id: body.trigger_id,
      view: config(existingAuth),
    });
  } catch (error) {
    logger.error(error);
  }
});

app.view("save_config", async ({ ack, body, view, logger }) => {
  try {
    await ack();
    const id = body.is_enterprise_install ? body.enterprise.id : body.team.id;
    const token = view.state.values.token_block.xsrf_token.value;
    const cookie = view.state.values.cookie_block.session_cookie.value;
    const auth = JSON.stringify({ token, cookie });

    await storeAuth(auth, id);
  } catch (error) {
    logger.error(error);
  }
});

(async () => {
  // Start the app
  await app.start(process.env.PORT || 3000);

  console.log("⚡️ Bolt app is running!");
})();
