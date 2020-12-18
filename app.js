const { App } = require("@slack/bolt");
const axios = require("axios");

// initialize env variables
const dotenv = require("dotenv");
dotenv.config();

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
});

const apiCall = async (method, requestUrl) => {
  try {
    const config = {
      method,
      url: `${process.env.API_BASE_URL}${requestUrl}`,
      headers: {
        Cookie: `XSRF-TOKEN=${process.env.XSRF_TOKEN}; SESSION=${process.env.SESSION_COOKIE}`,
      },
    };

    const { data } = await axios(config);
    return data;
  } catch (error) {
    console.error(error);
  }
};

app.command("/demo", async ({ ack, command, logger, say }) => {
  try {
    await ack();
    if (command.text === "stories") {
      const orgs = await apiCall("get", "slackpoint0/orgs/list");
      const workspaces = await apiCall("get", "slackpoint0/workspaces/list");
      const stories = await apiCall("get", "storybuilder/conversations");

      const storyList = stories.map((story) => {
        return `*${story.description}* - ${
          story.conversations_actions.length
        } messages in <#${story.conversations_actions[0].channel}> (${
          workspaces.find((workspace) => workspace.uid === story.workspace_uid)
            .name
        })\n`;
      });
      await say(storyList.join(""));
    }
  } catch (error) {
    logger.error(error);
  }
});

(async () => {
  // Start the app
  await app.start(process.env.PORT || 3000);

  console.log("⚡️ Bolt app is running!");
})();
