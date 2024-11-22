import { noteModel } from "@/services/sqlite/models/note.model";
import { useState, useEffect } from 'react';

export type NotedVerseType = {
  noteId: number;
  note: string;
  noteGroupId: number;
}

type UseHighlightNotesProps = {
  book: string;
  chapter: number;
}

type UseHighlightNotesReturn = {
  highlightedVerses: Map<number, NotedVerseType[]>;
  toggleHighlight: (verseIndex: number) => void;
  saveNote: (verseIndex: number, props: NotedVerseType) => void;
  loadHighlightedVerses: () => void;
  removeNote: (verseIndex: number, noteID: number) => void;
}

export const useHighlightNotes = ({ book, chapter }: UseHighlightNotesProps): UseHighlightNotesReturn => {
  const [highlightedVerses, setHighlightedVerses] = useState<Map<number, NotedVerseType[]>>(new Map());

  useEffect(() => {
    // Initialize the database table if it doesn't exist
    noteModel.createTable()
  }, []);

  const loadHighlightedVerses = async () => {
    if(!chapter) return;

    try {
      const data = await noteModel.findAll({
        where: [['book', '=', book], ['chapter', '=', chapter]],
      });

      const notes = new Map<number, NotedVerseType[]>();

      for (const row of data) {
        if(!notes.has(row.verseIndex)) {
          notes.set(row.verseIndex, [{ noteId: row.id, note: row.note, noteGroupId: row.noteGroupId || 0 }]);
        } else {
          notes.get(row.verseIndex)?.push({ noteId: row.id, note: row.note, noteGroupId: row.noteGroupId || 0 });
        }
      }

      setHighlightedVerses(notes);
    } catch (error) {
      console.error(error);
    }
  };

  const addHighlight = (verseIndex: number, { noteGroupId, note }: Omit<NotedVerseType, 'noteId'>) => {
    return noteModel.insert({
      book,
      chapter,
      verseIndex,
      note,
      noteGroupId
    })
  };

  const removeHighlight = (verseIndex: number) => {
    noteModel.delete([['book', '=', book], ['chapter', '=', chapter], ['verseIndex', '=', verseIndex]]);
  };

  const removeNote = (verseIndex: number, noteId: number) => {
    noteModel.delete([['id', '=', noteId]]);
    setHighlightedVerses(prev => {
      const updatedHighlights = new Map(prev);
      const notes = updatedHighlights.get(verseIndex)?.filter(note => note.noteId !== noteId) || []
      if(notes.length === 0) {
        updatedHighlights.delete(verseIndex);
        return updatedHighlights;
      }

      updatedHighlights.set(verseIndex, notes);
      return updatedHighlights;
    });
  };

  const updateNote = ({ noteId, note, noteGroupId }: NotedVerseType) => {
    noteModel.update(
      {
        note,
        noteGroupId
      },
      [['id', '=', noteId]]
    ).catch((err) => { console.error(err) });
  };

  const toggleHighlight = async (verseIndex: number) => {
    const isHighlighted = highlightedVerses.has(verseIndex);
    const updatedHighlights = new Map(highlightedVerses);

    if (isHighlighted) {
      updatedHighlights.delete(verseIndex);
      removeHighlight(verseIndex);
    } else {
      const noteId = await addHighlight(verseIndex, { note: '', noteGroupId: 0 });
      updatedHighlights.set(verseIndex, [{ noteId, note: '', noteGroupId: 0 }]);
    }

    setHighlightedVerses(updatedHighlights);
  };

  const saveNote = async (verseIndex: number, props: NotedVerseType) => {
    if(props.noteId === 0) {
      const noteId = await addHighlight(verseIndex, props);
      setHighlightedVerses(prev => {
        const updatedHighlights = new Map(prev);
        updatedHighlights.set(verseIndex, [...updatedHighlights.get(verseIndex) || [], { noteId, note: props.note, noteGroupId: props.noteGroupId }]);
        return updatedHighlights;
      });
      return;
    }
    updateNote(props);
    setHighlightedVerses(prev => {
      const updatedHighlights = new Map(prev);
      updatedHighlights.set(verseIndex, updatedHighlights.get(verseIndex)?.map(note => {
        if(note.noteId === props.noteId) {
          return props;
        }
        return note;
      }) || [props]);
      return updatedHighlights;
    });
  };

  return {
    highlightedVerses,
    toggleHighlight,
    saveNote,
    loadHighlightedVerses,
    removeNote
  };
};
