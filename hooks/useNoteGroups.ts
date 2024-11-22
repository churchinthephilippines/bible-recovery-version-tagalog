import { noteGroupModel, NoteGroupModelType } from "@/services/sqlite/models/note.group.model";
import { useEffect, useState } from "react";

export const useNoteGroups = () => {
  const [noteGroups, setNoteGroups] = useState<NoteGroupModelType[]>([]);

  useEffect(() => {
    const loadNoteGroups = async () => {
      await noteGroupModel.createTable();
      const data = await noteGroupModel.findAll();
      setNoteGroups(data);
    }

    loadNoteGroups();
  }, []);

  const saveNoteGroup = async (props: NoteGroupModelType) => {
    try {
      if(props.id === 0) {
        const noteGroupId = await noteGroupModel.insert({ name: props.name });
        setNoteGroups(prev => [...prev, { ...props, id: noteGroupId }]);
        return;
      }
      await noteGroupModel.update(props, [['id', '=', props.id]]);
      setNoteGroups(prev => {
        const updatedGroups = prev.filter(noteGroup => noteGroup.id !== props.id);
        return [...updatedGroups, props];
      });
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNoteGroup = async (noteGroupId: number) => {
    try {
      await noteGroupModel.delete([['id', '=', noteGroupId]]);
      setNoteGroups(prev => prev.filter(noteGroup => noteGroup.id !== noteGroupId));
    } catch (err) {
      console.error(err);
    }
  };

  return {
    noteGroups, 
    saveNoteGroup, 
    deleteNoteGroup
  }
  
}