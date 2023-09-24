import { Regexs } from "../../dictionary/RegExStr";
import ProductParser from "../ProductParser";
import BaseParser from "./BaseParser";

export type ParsedLSR = {
  rawTime: string;
  Type: string;
  Location: string;
  Lat: number;
  Lon: number;
  rawDate: string;
  Magnitude: number;
  County: string;
  State: string;
  Source: string;
  Remarks: string;
};

export class SubLsrParser {
  mainParser: LsrParser;
  report: string;
  rawTime: string;
  Type: string;
  Location: string;
  Lat: number;
  Lon: number;
  rawDate: string;
  Magnitude: number;
  County: string;
  State: string;
  Source: string;
  Remarks: string;

  constructor(mainParser: LsrParser, report: string) {
    this.mainParser = mainParser;
    this.report = report;

    this.rawTime = report.substring(0, 7).trim();
    this.Type = report.substring(12, 29).trim();
    this.Location = report.substring(29, 53).trim();
    this.Lat = parseFloat(report.substring(53, 58));
    this.Lon = -parseFloat(report.substring(59, 66));

    this.rawDate = report.substring(68, 78).trim();
    this.Magnitude = parseFloat(
      report
        .substring(78, 95)
        .trim()
        .replace(/[a-zA-Z]/g, ""),
    );
    this.County = report.substring(95, 114).trim();
    this.State = report.substring(114, 120).trim();
    this.Source = report.substring(120, 138).trim();

    // Handle data that is not neccearly included in the main report, extras.
    this.Remarks = report
      .substring(138, report.length)
      .split("\n")
      .join("")
      .split("            ")
      .join(" ")
      .trim();
  }
}

export default class LsrParser extends BaseParser {
  type: "lsr";
  message: string;
  parsedLSRs: SubLsrParser[] = [];

  constructor(Product: ProductParser) {
    super(Product);
    this.message = this.product.message;

    if (this.message.split("\n").length < 16) return; // No body is included
    if (this.message.includes("SUMMARY")) return; // Don't parse summaries.
    if (this.message.includes("..REMARKS..") == false) return; // Cant parse without remakrs, also you cant prefix with !... it doesnt work

    const body = this.message.split("..REMARKS..")[1].split("&&")[0].trim();

    this.parsedLSRs = body
      .split(Regexs.AMPM)
      .slice(1)
      .map((report, i) => {
        report = `${(body.match(Regexs.AMPM) || [])[i]}${report}`;
        return new SubLsrParser(this, report);
      });
  }
}
