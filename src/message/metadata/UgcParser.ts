import { Counties } from "../../dictionary/Counties";
import { MarineZones } from "../../dictionary/MarineZones";
import { States } from "../../dictionary/States";
import { Zones } from "../../dictionary/Zones";
import ProductParser from "../ProductParser";

export type ugcFormat = "C" | "Z";
export type UGCZonesExport = {
  state: States;
  type: ugcFormat;
  NNNs: string[];
}[];

export class PostOfficeUgc {
  raw: string;
  state: States;
  format: ugcFormat;
  NNNs: string[];
  zones: string[];
  counties: string[];

  constructor(postOffice) {
    this.raw = postOffice;
    this.state = postOffice.substring(0, 2);
    this.format = postOffice.substring(2, 3);
    const nonPostOfficePart = postOffice.substring(3);

    function expandRange(range: string): string[] {
      const [start, end] = range.split(">").map(parseFloat);
      return Array.from({ length: end - start + 1 }, (_, i) =>
        (start + i).toString().padStart(3, "0"),
      );
    }

    const parts = nonPostOfficePart.split("-");
    const mainArray: string[] = [];
    let subArray: string[] = [];

    for (const part of parts) {
      if (part.includes(">")) {
        subArray = subArray.concat(expandRange(part));
      } else {
        mainArray.push(...subArray, part);
        subArray = [];
      }
    }

    this.NNNs = mainArray.filter((NNN) => NNN !== "");
    // if code is 000 then it means all zones/counties
    this[this.format == "C" ? "counties" : "zones"] = this.NNNs.map((NNN) => {
      const dictonary =
        this.format == "C" ? Counties[this.state] : Zones[this.state];
      if (!dictonary) {
        return undefined;
      }
      return dictonary[NNN];
    });
  }
}

export default class UgcParser {
  rawUgc: string;
  postOffices: PostOfficeUgc[];

  constructor(rawUgc: string) {
    this.rawUgc = rawUgc;

    const postOfficeSplits = rawUgc.split(/(?=[A-Z]{3})/g);
    this.postOffices = postOfficeSplits.map(
      (split) => new PostOfficeUgc(split),
    );
  }

  parseUGCExpiryTime(): Date {
    const ugcSplits = this.rawUgc.split("-");
    const timeString = ugcSplits[ugcSplits.length - 2];
    const day = parseInt(timeString.slice(0, 2));
    const hour = parseInt(timeString.slice(2, 4));
    const min = parseInt(timeString.slice(4, 6));

    // Get the current date
    const currentDate = new Date();

    // Create a new date object based on the current date
    const resultDate = new Date(new Date());
    resultDate.setDate(day);

    if (day < 5 && currentDate.getDate() > 25) {
      // It's the next month
      resultDate.setMonth(currentDate.getMonth() + 1);
    }

    resultDate.setHours(hour, min, 0, 0);

    return resultDate;
  }

  exportUgcData(): UGCZonesExport {
    return this.postOffices.map((office) => {
      return {
        state: office.state,
        type: office.format,
        NNNs: office.NNNs,
      };
    });
  }

  getZones(): string[] {
    return this.postOffices
      .filter((office) => office.format == "Z")
      .map((office) => office.NNNs.map((NNN) => `${office.state}${NNN}`))
      .flat();
  }

  getCounties(): string[] {
    return this.postOffices
      .filter((office) => office.format == "C")
      .map((office) => office.NNNs.map((NNN) => `${office.state}${NNN}`))
      .flat();
  }

  getCombinedNNNs(): string[] {
    return [...this.getZones(), ...this.getCounties()];
  }
}
