import { Entity, ObjectIdColumn, ObjectId, Column, BaseEntity } from "typeorm";
import { ProductAttributes } from "../message/ProductParser";

@Entity()
export class RawMessage extends BaseEntity {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  rawMessage: string;

  @Column()
  attributes: ProductAttributes;

  @Column()
  created: Date;
}

// it did not detect
