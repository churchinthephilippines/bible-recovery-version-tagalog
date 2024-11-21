import NoteModel from "@/services/sqlite/models/note.model";
import { useState, useEffect } from 'react';

const noteModel = new NoteModel();

interface UseHighlightNotesProps {
  book: string;
  chapter: number;
}

interface UseHighlightNotesReturn {
  highlightedVerses: Map<number, string>;
  toggleHighlight: (verseIndex: number) => void;
  saveNote: (verseIndex: number, note: string) => void;
  loadHighlightedVerses: () => void;
}

export const useHighlightNotes = ({ book, chapter }: UseHighlightNotesProps): UseHighlightNotesReturn => {
  const [highlightedVerses, setHighlightedVerses] = useState<Map<number, string>>(new Map());

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

      const notes = new Map<number, string>();

      for (const row of data) {
        notes.set(row.verseIndex, row.note);
      }

      setHighlightedVerses(notes);
    } catch (error) {
      console.error(error);
    }
  };

  const addHighlight = (verseIndex: number, note: string = '') => {
    noteModel.insert({
      book,
      chapter,
      verseIndex,
      note,
    })
  };

  const removeHighlight = (verseIndex: number) => {
    noteModel.delete([['book', '=', book], ['chapter', '=', chapter], ['verseIndex', '=', verseIndex]]);
  };

  const updateNote = (verseIndex: number, note: string) => {
    noteModel.update(
      {
        note,
      },
      [['book', '=', book], ['chapter', '=', chapter], ['verseIndex', '=', verseIndex]]
    );
  };

  const toggleHighlight = (verseIndex: number) => {
    const isHighlighted = highlightedVerses.has(verseIndex);
    const updatedHighlights = new Map(highlightedVerses);

    if (isHighlighted) {
      updatedHighlights.delete(verseIndex);
      removeHighlight(verseIndex);
    } else {
      updatedHighlights.set(verseIndex, '');
      addHighlight(verseIndex, '');
    }

    setHighlightedVerses(updatedHighlights);
  };

  const saveNote = (verseIndex: number, note: string) => {
    console.log({verseIndex, note})
    updateNote(verseIndex, note);
    setHighlightedVerses(prev => new Map(prev).set(verseIndex, note));
  };

  return {
    highlightedVerses,
    toggleHighlight,
    saveNote,
    loadHighlightedVerses,
  };
};
