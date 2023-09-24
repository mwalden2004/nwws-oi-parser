import ProductParser from "../ProductParser";

export default class BaseParser {
  product: ProductParser;

  constructor(Product: ProductParser) {
    this.product = Product;
  }
}
