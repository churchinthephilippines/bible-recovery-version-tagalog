import { noteGroupModel, NoteGroupModelType } from "@/services/sqlite/models/note.group.model";
import { useEffect, useState } from "react";

export const useNoteGroups = () => {
  const [noteGroups, setNoteGroups] = useState<NoteGroupModelType[]>([]);

  const loadNoteGroups = async () => {
    const data = await noteGroupModel.findAll();
    setNoteGroups(data);
  }
  
  useEffect(() => {
    noteGroupModel.createTable()
  }, []);

  const saveNoteGroup = async (props: NoteGroupModelType) => {
    try {
      if(props.id === 0) {
        const noteGroupId = await noteGroupModel.insert({ name: props.name });
        setNoteGroups(prev => [...prev, { ...props, id: noteGroupId }]);
        return noteGroupId;
      }
      await noteGroupModel.update(props, [['id', '=', props.id]]);
      setNoteGroups(prev => {
        const updatedGroups = prev.filter(noteGroup => noteGroup.id !== props.id);
        return [...updatedGroups, props];
      });
      return props.id;
    } catch (err) {
      console.error(err);
      return props.id;
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
    deleteNoteGroup,
    loadNoteGroups
  }
  
}