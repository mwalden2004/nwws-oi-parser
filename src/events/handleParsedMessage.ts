import { Config } from "../config";
import { Alert } from "../entity";
import { AlertSources } from "../entity/Alert";
import { logToDiscordWebhook } from "../helpers";
import ProductParser from "../message/ProductParser";
import AlertParser from "../message/parsers/AlertParser";

export default async function handleParsedMessage(
  productParser: ProductParser,
) {
  if (productParser.productType == "alert") {
    for (const parsedProduct of productParser.parser as AlertParser[]) {
      if (parsedProduct.vtecs.length == 0) {
        console.error(
          `Undefined alert ${parsedProduct.product.cccc} ${parsedProduct.product.awipsid}`,
        );
        return; // Early return if 'vtecs' is undefined
      }
      for (const vtec of parsedProduct.vtecs) {
        const newAlert = new Alert();
        newAlert.rawMessage = productParser.message;
        newAlert.event = vtec.phenomena;
        newAlert.eventTrackingNumber = vtec.eventTrackingNumber;
        newAlert.office = vtec.office;
        newAlert.vtec = vtec.exportVtec();
        if (parsedProduct.polygon) {
          newAlert.polygon = parsedProduct.polygon;
        }
        newAlert.UGC = parsedProduct.ugc.exportUgcData();
        newAlert.counties = parsedProduct.ugc.getCounties();
        newAlert.zones = parsedProduct.ugc.getZones();
        newAlert.metadata = parsedProduct.metadata;
        newAlert.source = Config.enviorment as AlertSources;
        newAlert.issued = vtec.starts;
        newAlert.expires = vtec.ends;
        newAlert.created = new Date();

        // See if alert already exists
        const foundAlert = await Alert.findOne({
          where: {
            //@ts-expect-error typeorm doesnt handle . for mongo yet.
            "vtec.id": vtec.id,
            zones: { $in: parsedProduct.ugc.getCombinedNNNs() },
          },
        });

        // Handle Event Creation
        if (!foundAlert && !["CAN", "UPG", "EXP"].includes(vtec.action)) {
          await newAlert.save();
          console.log(`Created Alert: ${newAlert.vtec.id}`);
          logToDiscordWebhook(`Created Alert: ${newAlert.vtec.id}`)
          logToDiscordWebhook(`${newAlert.vtec.id} \n Before \n \`\`\`json \n ${JSON.stringify(newAlert)} \`\`\` `)
          // publishAlertNotification(createdAlert.id, 'create');
        }

        // Handle updates
        if (foundAlert && ["CON", "COR", "ROU", "EXT"].includes(vtec.action)) {
          foundAlert.rawMessage = productParser.message;
          foundAlert.event = vtec.phenomena;
          foundAlert.eventTrackingNumber = vtec.eventTrackingNumber;
          foundAlert.office = vtec.office;
          foundAlert.vtec = vtec.exportVtec();
          if (parsedProduct.polygon) {
            foundAlert.polygon = parsedProduct.polygon;
          }
          foundAlert.UGC = parsedProduct.ugc.exportUgcData();
          foundAlert.counties = parsedProduct.ugc.getCounties();
          foundAlert.zones = parsedProduct.ugc.getZones();
          foundAlert.metadata = parsedProduct.metadata;
          foundAlert.source = Config.enviorment as AlertSources;
          foundAlert.issued = vtec.starts;
          foundAlert.expires = vtec.ends;
          foundAlert.created = new Date();
          console.log(`Updated Alert: ${foundAlert.vtec.id}`);
          logToDiscordWebhook(`Updated Alert: ${foundAlert.vtec.id}`)
          logToDiscordWebhook(`${newAlert.vtec.id} \n Before \n \`\`\`json \n ${JSON.stringify(newAlert)} \`\`\` After \n \`\`\`json \n ${JSON.stringify(foundAlert)} \`\`\` `)
          // publishAlertNotification(updatedAlert.id, 'update');
        }

        // Handle zone changes
        if (foundAlert && ["CAN", "UPG", "EXP"].includes(vtec.action)) {
          const storedZones = foundAlert.zones.filter(
            (zone) => !newAlert.zones.includes(zone),
          );

          if (storedZones.length === 0) {
            await foundAlert.remove();
            console.log(
              `Deleting alert (${
                foundAlert.vtec.id
              }) due to no zones: Removed Zones: ${JSON.stringify(
                storedZones,
              )}`,
            );
            logToDiscordWebhook(`${newAlert.vtec.id} \n Deleted alert: \n \`\`\`json \n ${JSON.stringify(newAlert)} \`\`\` `)
            // publishAlertNotification(dbAlert.id, 'update');
          } else {
            foundAlert.counties = parsedProduct.ugc.getCounties();
            foundAlert.zones = parsedProduct.ugc.getZones();
            foundAlert.issued = vtec.starts;
            foundAlert.expires = vtec.ends;
            await foundAlert.save();
            logToDiscordWebhook(`Updated alert (${
              foundAlert.vtec.id
            }) to remove unused zones: Removed Zones: ${JSON.stringify(
              foundAlert.zones,
            )} Current Zones: ${JSON.stringify(storedZones)}`)
            console.log(
              `Updated alert (${
                foundAlert.vtec.id
              }) to remove unused zones: Removed Zones: ${JSON.stringify(
                foundAlert.zones,
              )} Current Zones: ${JSON.stringify(storedZones)}`,
            );
            logToDiscordWebhook(`${newAlert.vtec.id} \n Before \n \`\`\`json \n ${JSON.stringify(newAlert)} \`\`\` After \n \`\`\`json \n ${JSON.stringify(foundAlert)} \`\`\` `)
            // publishAlertNotification(dbAlert.id, 'update');
          }
        }
      }
    }
  }
}
