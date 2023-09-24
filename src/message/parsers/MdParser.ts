import ProductParser from "../ProductParser";
import BaseParser from "./BaseParser";

export default class MdParser extends BaseParser {
  type: "md";

  constructor(Product: ProductParser) {
    super(Product);
  }
}
