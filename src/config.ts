import "dotenv/config";

export const Config = {
  database: process.env.DATABASE_URL,
  xmpp: {
    username: process.env.XMPP_Username,
    password: process.env.XMPP_Password,
    project: process.env.XMPP_Project,
  },
  discordWebhook: process.env.DiscordWebhook,
  namespace: process.env.Namespace || "1b671a64-40d5-491e-99b0-da01ff1f3341",
  enviorment: process.env.Enviorment || "nwws_oi",
  loggingEnabled: process.env.EnableLogging == "true",
  NODE_TLS_REJECT_UNAUTHORIZED: process.env.NODE_TLS_REJECT_UNAUTHORIZED,
};
