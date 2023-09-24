import { Zones } from "./dictionary/Zones";
import { Counties } from "./dictionary/Counties";
import { Regexs } from "./dictionary/RegExStr";
import { Config } from "./config";
import fetch from 'node-fetch';

/*
 *  Takes in a UGC string and parses into zones
 *  ugcString: OHZ003-006>014-017>023-027>033-036>038-047-089-PAZ001>003-150300-
 */

interface UgcResult {
  zones: string[];
  areas: { [state: string]: string[] };
}

export function parseUgc(ugcString: string): UgcResult {
  const matchedUgc: RegExpMatchArray = ugcString.match(
    Regexs.ugcPiece,
  ) as RegExpMatchArray;
  const specificZones: string[] = [];
  const areas: { [state: string]: string[] } = {};

  for (const ugc of matchedUgc) {
    let starting = ugcString.search(ugc);
    let newMsg = ugcString.substr(starting);
    let match: RegExpMatchArray | String | null = newMsg.match(
      Regexs.ugcIndividual,
    );

    if (Array.isArray(match)) {
      match = match[0];
    } else if (match == null) {
      match = newMsg;
    }

    let state = match.substring(0, 2);
    let type = match.substring(2, 3);
    let areas = match.substring(3, match.length - 1).split("-");

    for (const area of areas) {
      let innerAreas = area.split("-")[0];

      // There is only one zone in the string
      if (innerAreas.search(">") == -1) {
        specificZones.push(
          state + type + parseZoneInteger(parseInt(innerAreas)),
        );
        continue;
      }

      // There is a list of multiple zones, proccess each to find betwixt zones
      const zones = innerAreas.split(">");
      let counter = parseInt(zones[0]);
      while (counter <= parseInt(zones[1])) {
        specificZones.push(state + type + parseZoneInteger(counter));
        counter++;
      }
    }
  }

  for (const ugc of specificZones) {
    const state = ugc.substring(0, 2);
    const type = ugc.substring(2, 3);
    const code = ugc.substring(3, ugc.length);

    const county =
      type == "C"
        ? Counties[state][code]
        : type == "Z"
        ? Zones[state] !== undefined
          ? Zones[state][code]
          : Zones[state][code]
        : undefined;
    if (county !== undefined) {
      if (areas[state] == undefined) {
        areas[state] = [];
      }
      areas[state].push(county);
    }
  }

  return {
    zones: specificZones,
    areas: areas,
  };
}

export function parseZoneInteger(number: number): string {
  if (number < 10) {
    return "00" + number;
  } else if (number < 100) {
    return "0" + number;
  } else {
    return number.toString();
  }
}

export function dateToZuluDateString(date): string {
  const year = (date.getUTCFullYear() - 2000).toString().padStart(2, "0");
  const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const day = date.getUTCDate().toString().padStart(2, "0");
  const hours = date.getUTCHours().toString().padStart(2, "0");
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");

  return `${year}${month}${day}T${hours}${minutes}Z`;
}


export async function logToDiscordWebhook(message) {
  try {
    const response = await fetch(Config.discordWebhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: message }),
    });

    if (response.ok) {
      console.log('Message sent to Discord webhook successfully');
    } else {
      console.error('Error sending message to Discord webhook:', response.status, response.statusText);
    }
  } catch (error) {
    //@ts-expect-error sorry
    console.error('Error sending message to Discord webhook:', error.message);
  }
}