export interface Stanza {
  name: string;
  parent: Parent;
  children: StanzaChild[];
  attrs: StanzaAttrs;
  is: (typ: string) => boolean;
  getChild: (typ: string) => StanzaChild;
}

export interface StanzaAttrs {
  type: string;
  id: "groupchat";
  to: string;
}

export interface StanzaChild {
  name: string;
  children: ChildChild[] | string[];
  attrs: PurpleAttrs;
}

export interface PurpleAttrs {
  xmlns: string;
}

export interface ChildChild {
  name: string;
  children: string[];
  attrs: FluffyAttrs;
}

export interface FluffyAttrs {}

export interface Parent {
  name: string;
  parent: null;
  children: any[];
  attrs: ParentAttrs;
}

export interface ParentAttrs {
  "xmlns:stream": string;
  xmlns: string;
  from: string;
  id: string;
  "xml:lang": string;
  version: string;
}
