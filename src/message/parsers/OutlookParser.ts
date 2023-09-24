import ProductParser from "../ProductParser";
import BaseParser from "./BaseParser";

export default class OutlookParser extends BaseParser {
  type: "outlook";

  constructor(Product: ProductParser) {
    super(Product);
  }
}
