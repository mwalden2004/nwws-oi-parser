import { Config } from "./config";
import "./data-source";
import { client, xml } from "@xmpp/client";
import ProductParser from "./message/ProductParser";
import { RawMessage } from "./entity/RawMessage";
import { Datasource } from "./data-source";
import { parse, stringify } from "flatted";
import handleParsedMessage from "./events/handleParsedMessage";

if (Config.loggingEnabled) {
  console.log(`WxLogic - NWWS-OI Parser`);
  console.log(`Logging enabled.`);
}

const NWS_XMPP_Connection = client({
  service: "nwws-oi.weather.gov",
  domain: "nwws-oi.weather.gov",
  username: Config.xmpp.username,
  password: Config.xmpp.password,
});

NWS_XMPP_Connection.on("stanza", async (stanza) => {
  if (!stanza.is("message")) return;
  try {
    const childStanza = stanza.getChild("x");
    if (!childStanza || !childStanza?.children || !childStanza?.children[0])
      return;
    const stanzaAtributes = childStanza.attrs;
    const message = childStanza.children[0];
    const parser = new ProductParser(message, stanzaAtributes);
    await parser.parse();

    if (Config.loggingEnabled) {
      const newMessage = new RawMessage();
      newMessage.rawMessage = message;
      newMessage.attributes = stanzaAtributes;
      newMessage.created = new Date();
      newMessage.save();
    }

    handleParsedMessage(parser);
  } catch (e) {
    if (Config.loggingEnabled) console.log(e);
  }
});

NWS_XMPP_Connection.on(
  "online",
  (address: { _domain: string; _local: string; _resource: string }) => {
    if (Config.loggingEnabled)
      console.log(`Connected to NWWS-OI Client, connecting to channel`);

    NWS_XMPP_Connection.send(
      xml(
        "presence",
        { to: `nwws@conference.nwws-oi.weather.gov/${Config.xmpp.project}` },
        { xmlns: "http://jabber.org/protocol/muc" },
      ),
    );
    if (Config.loggingEnabled) console.log("Connected to alert stream room.");
  },
);

async function start() {
  if (Config.loggingEnabled) console.log(`Connecting.`);
  await Datasource.initialize();
  NWS_XMPP_Connection.start().catch(console.error);
}

start();
