import { Entity, ObjectIdColumn, ObjectId, Column, BaseEntity } from "typeorm";
import { AlertMetadata, PolygonArray } from "../message/parsers/AlertParser";
import { UGCZonesExport } from "../message/metadata/UgcParser";
import { VTECType } from "../message/metadata/VtecParser";
import { WFOs } from "../dictionary/WFOs";
import { PhenomenaType } from "../dictionary/Phenomena";

export type AlertSources = "nwws_oi" | "nws_api" | "local_test";

@Entity()
export class Alert extends BaseEntity {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  rawMessage: string;
  @Column()
  event: PhenomenaType;
  @Column()
  eventTrackingNumber: string;
  @Column()
  office: WFOs;
  @Column()
  vtec: VTECType;
  @Column()
  polygon?: PolygonArray;
  @Column()
  UGC: UGCZonesExport;
  @Column()
  counties: string[];
  @Column()
  zones: string[];
  @Column()
  metadata: AlertMetadata;
  @Column()
  source: AlertSources;
  @Column()
  issued: Date | null;
  @Column()
  expires: Date | null;

  @Column()
  created: Date;
}

// it did not detect
