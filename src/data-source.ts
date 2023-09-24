import "reflect-metadata";
import { DataSource } from "typeorm";
import { Config } from "./config";
import { Alert, RawMessage } from "./entity";

export const Datasource = new DataSource({
  type: "mongodb",
  url: Config.database,
  dropSchema: false,
  synchronize: false,
  useUnifiedTopology: true,
  entities: [RawMessage, Alert],
});
