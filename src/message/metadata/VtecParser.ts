import { Config } from "../../config";
import { PhenomenaType } from "../../dictionary/Phenomena";
import { WFOs } from "../../dictionary/WFOs";
import { v5 } from "uuid";

export type VTECType = {
  id: string; // custom vtec id
  status: VtecStatus; // vtec[0]  O
  action: VtecAction; // vtec[1]  CAN
  office: VtecCCCC; // vtec[2]  KBUF
  phenomena: Phenomena; // vtec[3]  SC
  significance: Significance; // vtec[4]  Y
  eventTrackingNumber: eventTrackingNumber; // vtec[5]  0012
  starts: Date | null; // if null means date is 000 / no known expiry
  ends: Date | null; // if null means date is 000 / no known expiry
};
export type VtecStatus = "O" | "T" | "E" | "X";
export type VtecAction =
  | "NEW"
  | "CON"
  | "EXT"
  | "EXA"
  | "EXB"
  | "UPG"
  | "CAN"
  | "EXP"
  | "COR"
  | "ROU";
export type VtecCCCC = WFOs;
export type Phenomena = PhenomenaType;
export type Significance = "W" | "A" | "Y" | "S" | "F" | "O" | "N";
export type eventTrackingNumber = string;

export default class VtecParser {
  id: string; // custom vtec id
  raw: string; // unparsed vtec string
  status: VtecStatus; // vtec[0]  O
  action: VtecAction; // vtec[1]  CAN
  office: VtecCCCC; // vtec[2]  KBUF
  phenomena: PhenomenaType; // vtec[3]  SC
  significance: Significance; // vtec[4]  Y
  eventTrackingNumber: eventTrackingNumber; // vtec[5]  0012
  starts: Date | null; // if null means date is 000 / no known expiry
  ends: Date | null; // if null means date is 000 / no known expiry

  constructor(raw) {
    const vtecExp = raw.split(".");

    this.raw = raw;
    this.status = vtecExp[0];
    this.action = vtecExp[1];
    this.office = vtecExp[2];
    this.phenomena = vtecExp[3];
    this.significance = vtecExp[4];
    this.eventTrackingNumber = vtecExp[5];

    const times = vtecExp[6].split("-");
    // move this to nodejs date
    this.starts = this.parseVtecTime(times[0]);
    this.ends = this.parseVtecTime(times[1]);

    this.id = v5(
      `${this.office}${this.eventTrackingNumber}${this.phenomena}${this.significance}`,
      Config.namespace,
    );
  }

  parseVtecTime(str: string): Date | null {
    if (str === "000000T0000Z") {
      return null;
    }
    const year = parseInt(str.slice(0, 2)) + 2000;
    const month = parseInt(str.slice(2, 4)) - 1;
    const day = parseInt(str.slice(4, 6));
    const hour = parseInt(str.slice(7, 9));
    const minute = parseInt(str.slice(9, 11));

    return new Date(Date.UTC(year, month, day, hour, minute));
  }

  exportVtec(): VTECType {
    return {
      id: this.id,
      status: this.status,
      action: this.action,
      office: this.office,
      phenomena: this.phenomena,
      significance: this.significance,
      eventTrackingNumber: this.eventTrackingNumber,
      starts: this.starts,
      ends: this.ends,
    };
  }
}
