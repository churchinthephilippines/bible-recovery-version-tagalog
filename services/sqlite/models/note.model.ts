import { BaseModel, SchemaDefinition } from "../base.model";

const schema = {
  id: 'INTEGER PRIMARY KEY',
  book: 'TEXT NOT NULL',
  chapter: 'INTEGER NOT NULL',
  verseIndex: 'INTEGER NOT NULL',
  note: 'TEXT NOT NULL',
  noteGroupId: 'INTEGER',
} satisfies SchemaDefinition;

export default class NoteModel extends BaseModel<typeof schema> {
  constructor() {
    super('note', schema);
  }
}

export type NoteModelType = Awaited<ReturnType<NoteModel["findAll"]>>[number];

export const noteModel = new NoteModel();
