import { v5 } from "uuid";
import { Regexs } from "../../dictionary/RegExStr";
import ProductParser from "../ProductParser";
import UgcParser from "../metadata/UgcParser";
import VtecParser from "../metadata/VtecParser";
import BaseParser from "./BaseParser";
import { Config } from "../../config";
import { dateToZuluDateString } from "../../helpers";

export type AlertMetadata = {
  timeMotionLocation?: string | null;
  tornado?: string | null;
  hail?: number | null;
  wind?: number | null;
  hazard?: string | null;
  source?: string | null;
  impact?: string | null;
  what?: string | null;
  where?: string | null;
  when?: string | null;
  impacts?: string | null;
  tornadoDamageThreat?: string | null;
  actions?: string | null;
  PDS?: boolean;
  Time?: number | null;
  Direction?: number | null;
  Speed?: number | null;
  Lat?: number | null;
  Long?: number | null;
};

export type Polygon = [number, number];
export type PolygonArray = Polygon[];

export default class AlertParser extends BaseParser {
  type: "alert";
  subproduct: string;
  vtecs: VtecParser[];
  metadata: AlertMetadata;
  ugc: UgcParser;
  polygon: PolygonArray | null; //lat/long

  constructor(Product: ProductParser, subproduct: string) {
    super(Product);
    this.subproduct = subproduct;
    this.ugc = this.parseUGC();
    this.vtecs = Product.awipsid.startsWith("SPS")
      ? this.generateFakeVTECForSPS()
      : (this.subproduct.match(Regexs.VTEC) || []).map(
          (rawVTEC) => new VtecParser(rawVTEC),
        );
    this.metadata = this.getMeta();
    this.polygon = this.getPolygonDetails();
  }

  generateFakeVTECForSPS(): VtecParser[] {
    return [
      new VtecParser(
        `O.NEW.${this.product.cccc.substring(1)}.SPS.W.${v5(
          JSON.stringify([...this.ugc.getCounties(), this.ugc.getZones()]) +
            this.ugc.parseUGCExpiryTime(),
          Config.namespace,
        )}.${dateToZuluDateString(new Date())}-${dateToZuluDateString(
          this.ugc.parseUGCExpiryTime(),
        )}`,
      ),
    ];
  }

  parseUGC() {
    const ugcStart = this.subproduct.search(Regexs.ugc);
    const ugcEnd = this.subproduct.substring(ugcStart).search("\n");
    const ugcFull = this.subproduct.substring(ugcStart, ugcStart + ugcEnd);

    return new UgcParser(ugcFull);
  }

  getPolygonDetails(): PolygonArray | null {
    // Find the indices for relevant substrings
    const latLonIndex = this.subproduct.indexOf("LAT...LON");
    const timeMotLocIndex = this.subproduct.indexOf("TIME...MOT...LOC");

    // If LAT...LON doesn't exist, return null
    if (latLonIndex === -1) {
      return null;
    }

    // Calculate the end index based on the presence of TIME...MOT...LOC
    const end =
      timeMotLocIndex === -1
        ? this.subproduct.indexOf("$$") - 2
        : timeMotLocIndex;

    // Extract and clean the parsed locations string
    const parsedLocations = this.subproduct
      .substring(latLonIndex + 10, end)
      .replace(/\s+/g, " ");

    // Split the cleaned string into an array of strings
    const splitLocations = parsedLocations.split(" ");

    // Initialize an empty polygon array
    const polygon: PolygonArray = [];

    // Iterate through splitLocations and construct the polygon
    for (let i = 0; i < splitLocations.length; i += 2) {
      const lat = (-1 * parseFloat(splitLocations[i])) / 100;
      const long = parseFloat(splitLocations[i + 1]) / 100;

      if (!isNaN(lat) && !isNaN(long)) {
        polygon.push([lat, long]);
      }
    }

    // Close the polygon if there are points
    if (polygon.length !== 0) {
      polygon.push(polygon[0]);
    }

    return polygon;
  }

  getMeta(): AlertMetadata {
    const meta: AlertMetadata = {};
    const subproduct = this.subproduct;

    function extractData(header: string | RegExp): string | null {
      const startIndex = subproduct.search(header);
      if (startIndex === -1) return null;

      const endIndex = subproduct.indexOf("\n\n", startIndex);
      let dataString = subproduct
        .substring(startIndex, endIndex)
        .replace(header, "")
        .trim();

      if (header === "PRECAUTIONARY/PREPAREDNESS ACTIONS...") {
        // Handle the "PRECAUTIONARY/PREPAREDNESS ACTIONS..." section
        const actionsStartIndex = endIndex + 2; // Move past the double newline
        const actionsEndIndex = subproduct.indexOf("&&", actionsStartIndex);
        if (actionsEndIndex !== -1) {
          dataString +=
            " " +
            subproduct.substring(actionsStartIndex, actionsEndIndex).trim();
        }
      }

      return dataString.split("\n").join(" ").split("   ").join(" ").trim();
    }

    meta.PDS = subproduct.includes("PARTICULARLY DANGEROUS SITUATION");
    const regexs = {
      timeMotionLocation: "TIME...MOT...LOC",
      tornado: new RegExp(/TORNADO\.{3}/g),
      hazard: new RegExp(/HAZARD\.{3}/g),
      source: new RegExp(/SOURCE\.{3}/g),
      impact: new RegExp(/IMPACT\.{3}/g),
      what: new RegExp(/WHAT\.{3}/g),
      where: new RegExp(/WHERE\.{3}/g),
      when: new RegExp(/WHEN\.{3}/g),
      impacts: new RegExp(/IMPACTS\.{3}/g),
      tornadoDamageThreat: new RegExp(/TORNADO DAMAGE THREAT\.{3}/g),
      actions: "PRECAUTIONARY/PREPAREDNESS ACTIONS...",
    };

    for (const key of Object.keys(regexs)) {
      const regex = regexs[key];
      const data = extractData(regex);
      if (data !== null) {
        meta[key] = data.replace(/\s+/g, " ");
      }
    }

    const hail = subproduct.match(
      new RegExp(/MAX HAIL SIZE\.\.\.(\d+(\.\d+)?) IN/g),
    );
    const wind = subproduct.match(new RegExp(/MAX WIND GUST\.\.\.(\d+) MPH/g));

    if (hail) {
      const numberMatch = hail[0].match(/\d+(\.\d+)?/);
      meta.hail = numberMatch ? parseFloat(numberMatch[0]) : null;
    }
    if (wind) {
      const numberMatch = wind[0].match(/\d+(\.\d+)?/);
      meta.wind = numberMatch ? parseFloat(numberMatch[0]) : null;
    }

    if (meta.timeMotionLocation) {
      const splits = meta.timeMotionLocation.split(" ");
      const Time = splits[0];
      const Direction = splits[1];
      const Speed = splits[2];
      const Lat = splits[3];
      const Long = splits[4];
      meta.Time = parseFloat(Time.split("Z")[0]);
      meta.Direction = parseFloat(Direction.split("DEG")[0]);
      meta.Speed = parseFloat(Speed.split("KT")[0]);
      meta.Lat = parseFloat(Lat) / 100;
      meta.Long = parseFloat(Long) / 100;
    }

    return meta;
  }
}
