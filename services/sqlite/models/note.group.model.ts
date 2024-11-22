import { BaseModel, SchemaDefinition } from "../base.model";

const schema = {
  id: 'INTEGER PRIMARY KEY',
  name: 'TEXT NOT NULL',
} satisfies SchemaDefinition;

export default class NoteGroupModel extends BaseModel<typeof schema> {
  constructor() {
    super('noteGroup', schema);
  }
}

export type NoteGroupModelType = Awaited<ReturnType<NoteGroupModel["findAll"]>>[number];

export const noteGroupModel = new NoteGroupModel();