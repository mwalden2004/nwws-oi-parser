import { Phenomena } from "../dictionary/Phenomena";
import AlertParser from "./parsers/AlertParser";
import LsrParser from "./parsers/LsrParser";
import MdParser from "./parsers/MdParser";
import OutlookParser from "./parsers/OutlookParser";

export type ProductType = "outlook" | "alert" | "lsr" | "md";

export type ProductAttributes = {
  xmlns: string; //nwws-oi
  cccc: string; //issuer
  ttaaii: string; //'FOUS53'
  issue: string; //string but actually a date
  awipsid: string; //example: 'PFMOAX'
  id: string; //XMPP message id
};

export default class ProductParser {
  message: string;
  productType: ProductType | false;
  cccc: string;
  ttaaii: string;
  issue: string;
  awipsid: string;
  parser: AlertParser[] | LsrParser | MdParser | OutlookParser;

  constructor(message: string, attributes: ProductAttributes) {
    if (typeof message !== "string" || message.length <= 2) return;
    this.message = decodeURI(message);
    this.cccc = attributes.cccc;
    this.ttaaii = attributes.ttaaii;
    this.issue = attributes.issue;
    this.awipsid = attributes.awipsid;
    this.productType = this.getAlertType(); // this must be AFTER the above. don't ask me why.
  }

  getAlertType(): ProductType | false {
    if (this.awipsid.startsWith("SWOMCD")) return "outlook";
    if (this.awipsid.startsWith("LSR")) return "lsr";
    if (this.awipsid.startsWith("SWOMCD")) return "md";
    if (
      this.awipsid.startsWith("SPS") ||
      Object.keys(Phenomena).includes(this.awipsid.substring(0, 2))
    )
      return "alert";
    return false;
  }

  async parse() {
    const pType = this.getAlertType();
    if (!pType) return;

    //really any external logic should be performed here. not within an alert.

    if (pType == "alert") {
      const alertSegments = this.message.split("$$");
      alertSegments.pop(); // We do not need the blank content at the end of the alert message.
      const parsedAlerts: AlertParser[] = [];
      for (const segment of alertSegments) {
        const parser = new AlertParser(this, segment);
        parsedAlerts.push(parser);
      }
      this.parser = parsedAlerts;
      return;
    }

    if (pType == "outlook") {
      this.parser = new OutlookParser(this);

      return;
    }
    if (pType == "lsr") {
      this.parser = new LsrParser(this);

      return;
    }
    if (pType == "md") {
      this.parser = new MdParser(this);

      return;
    }
  }
}
