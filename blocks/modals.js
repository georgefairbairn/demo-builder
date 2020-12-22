module.exports = {
  confirmDelete: (storyId) => ({
    type: "modal",
    callback_id: "delete_confirmed",
    private_metadata: storyId,
    title: {
      type: "plain_text",
      text: "Story Manager",
      emoji: true,
    },
    submit: {
      type: "plain_text",
      text: "Delete",
      emoji: true,
    },
    close: {
      type: "plain_text",
      text: "Cancel",
      emoji: true,
    },
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "Are you sure you want to delete this story?",
          emoji: true,
        },
      },
      {
        type: "context",
        elements: [
          {
            type: "plain_text",
            text:
              "The story will be deleted here and in DemoZone, and cannot be retrieved",
            emoji: true,
          },
        ],
      },
    ],
  }),
  config: (existingAuth) => ({
    type: "modal",
    private_metadata: JSON.stringify(existingAuth),
    callback_id: "save_config",
    title: {
      type: "plain_text",
      text: "Story Manager",
      emoji: true,
    },
    submit: {
      type: "plain_text",
      text: "Submit",
      emoji: true,
    },
    close: {
      type: "plain_text",
      text: "Cancel",
      emoji: true,
    },
    blocks: [
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text:
              ":information_source: <https://google.com|Click here> for instructions on how to retrieve your DemoZone cookie and token",
          },
        ],
      },
      {
        type: "input",
        block_id: "token_block",
        element: {
          type: "plain_text_input",
          initial_value: existingAuth.token || "",
          action_id: "xsrf_token",
        },
        label: {
          type: "plain_text",
          text: ":purse: XSRF Token",
          emoji: true,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: " ",
        },
      },
      {
        type: "input",
        block_id: "cookie_block",
        element: {
          type: "plain_text_input",
          initial_value: existingAuth.cookie || "",
          action_id: "session_cookie",
        },
        label: {
          type: "plain_text",
          text: ":cookie: Session Cookie",
          emoji: true,
        },
      },
    ],
  }),
};
