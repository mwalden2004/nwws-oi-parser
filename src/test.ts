import { Datasource } from "./data-source";
import { Alert } from "./entity";
import handleParsedMessage from "./events/handleParsedMessage";
import { logToDiscordWebhook } from "./helpers";
import ProductParser from "./message/ProductParser";
import AlertParser from "./message/parsers/AlertParser";

async function test() {
  await Datasource.initialize();

  const productParser = new ProductParser(
    `254 
WWUS84 KBMX 151345
SPSBMX

Special Weather Statement
National Weather Service Birmingham AL
845 AM CDT Tue Aug 15 2023
 
ALZ017-018-151430-
Etowah AL-Blount AL-
845 AM CDT Tue Aug 15 2023

...Strong thunderstorms will impact portions of Blount and Etowah
Counties through 930 AM CDT...

At 844 AM CDT, Doppler radar was tracking strong thunderstorms along
a line extending from near Sardis City to Hayden. Movement was east
at 35 mph.

HAZARD...Winds in excess of 40 mph.

SOURCE...Radar indicated.

IMPACT...Gusty winds could knock down tree limbs and blow around 
         unsecured objects.

Locations impacted include...
Gadsden, Rainbow City, Boaz, Oneonta, Attalla, Blountsville,
Cleveland, Sardis City, Locust Fork, Steele, Altoona, Snead, Susan
Moore, Walnut Grove, Reece City, Allgood, Fairview, Hayden, Nectar
and Rosa.

PRECAUTIONARY/PREPAREDNESS ACTIONS...

If outdoors, consider seeking shelter inside a building. 

Torrential rainfall is also occurring with these storms and may lead
to localized flooding. Do not drive your vehicle through flooded
roadways.

Frequent cloud to ground lightning is occurring with these storms.
Lightning can strike 10 miles away from a thunderstorm. Seek a safe
shelter inside a building or vehicle.

&&

LAT...LON 3410 8630 3418 8619 3420 8610 3420 8584
      3411 8584 3412 8579 3393 8616 3398 8619
      3397 8625 3398 8629 3391 8635 3389 8634
      3383 8641 3388 8689 3395 8683 3405 8668
      3409 8669 3412 8660 3420 8655 3422 8642
TIME...MOT...LOC 1344Z 272DEG 31KT 3421 8609 3388 8672 

MAX HAIL SIZE...0.00 IN
MAX WIND GUST...40 MPH

$$

56`,
    {
      xmlns: "nwws-oi",
      cccc: "KBMX",
      ttaaii: "SVSUS12",
      issue: "2022",
      awipsid: "SPSBMX",
      id: "1",
    },
  );
  await productParser.parse();
  handleParsedMessage(productParser);
}

test();
