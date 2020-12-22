module.exports = {
  app_home_loading: {
    type: "home",
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "Authentication",
          emoji: true,
        },
      },
      {
        type: "divider",
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "XSRF Token :purse:",
        },
        accessory: {
          type: "button",
          text: {
            type: "plain_text",
            text: "Edit",
            emoji: true,
          },
          action_id: "edit_token",
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "Session Cookie :cookie:",
        },
        accessory: {
          type: "button",
          text: {
            type: "plain_text",
            text: "Edit",
            emoji: true,
          },
          action_id: "edit_cookie",
        },
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text:
              ":information_source: <https://google.com|Click here> to see an instructional video on how to retrieve your DemoZone cookie and token",
          },
        ],
      },
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "Your Stories",
          emoji: true,
        },
      },
      {
        type: "divider",
      },
      {
        type: "section",
        text: {
          type: "plain_text",
          text: "Loading your list of stories...",
        },
      },
    ],
  },
  app_home: (auth, stories) => ({
    type: "home",
    blocks: [
      {
        type: "actions",
        elements: [
          {
            type: "button",
            style: "primary",
            text: {
              type: "plain_text",
              text: "Reload Stories :repeat:",
              emoji: true,
            },
            action_id: "reload_stories",
          },
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "Configuration :gear:",
              emoji: true,
            },
            action_id: "edit_config",
          },
        ],
      },
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "Your Stories",
          emoji: true,
        },
      },
      {
        type: "divider",
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text:
            !auth.token || !auth.cookie || stories.length === 0
              ? "No saved stories or invalid credentials - try entering a valid *XSRF Token* and *Session Cookie*"
              : " ",
        },
      },
      ...stories,
    ],
  }),
};
