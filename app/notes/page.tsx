"use client";

import { useEffect, useState } from "react";
import Masonry from 'react-masonry-css';
import { toast } from "react-toastify";

const breakpointColumnsObj = {
  default: 4,
  1100: 3,
  700: 2,
  500: 1,
};

export default function Notes() {
    const [notes, setNotes] = useState<any[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editTitle, setEditTitle] = useState<string>("");
    const [editContent, setEditContent] = useState<string>("");

    useEffect(() => {
        const fetchNotes = async () => {
            const res = await fetch ('/api/notes');
            const data = await res.json();
            setNotes(data);
        }

        fetchNotes()
    }, [])

    const deleteNote = async (id: number) => {
        await fetch('/api/notes/delete', {
            method: "DELETE",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        })
        setNotes(prev => prev.filter(task => task.id !== id));
        toast.success("Задача успешно удалена");
    }

    const startEditing = (note: any) => {
        setEditingId(note.id);
        setEditTitle(note.title);
        setEditContent(note.content);
    }

    const saveNote = async () => {
        if (!editTitle.trim()) return;
        const updatedNote = {
            id: editingId,
            title: editTitle,
            content: editContent,
        };
        const res = await fetch(`/api/notes/${editingId}`, {
            method: "PUT",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedNote),
        });
        setNotes(prev => prev.map(note => note.id === editingId ? { ...note, title: editTitle, content: editContent } : note));
        toast.success("Заметка обновлена");
        setEditingId(null);
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            saveNote();
        }
    };

    const createNote = async () => {
        const res = await fetch('/api/notes/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });

        const newNote = await res.json();
        setNotes((prev) => [newNote, ...prev]);
        toast.success('Заметка создана');
    }
 
    return (
        <div>
            <div className="flex flex-col gap-3 md:flex-row justify-between items-center m-3 mb-6">
                <h1 className="text-2xl font-bold text-center md:text-start">Мои заметки</h1>
                <button
                    onClick={createNote} 
                    className='bg-white py-3 px-10 rounded-2xl shadow-sm cursor-pointer font-semibold hover:scale-102 transition-transform'>
                    Создать заметку
                </button>
            </div>

        <Masonry
            breakpointCols={breakpointColumnsObj}
            className="flex w-auto"
            columnClassName="px-2"
        >
            {notes.map((note) => (
            <div
                key={note.id}
                className="bg-white rounded-2xl p-5 mb-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 ease-out hover:scale-102"
            >
                {editingId === note.id ? (
                <>
                    <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="text-lg font-semibold text-gray-800 w-full mb-2 p-1 border-b focus:outline-none focus:border-red-400"
                    autoFocus
                    />
                    <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="text-gray-600 w-full p-1 border-b focus:outline-none focus:border-red-400 resize-none"
                    rows={3}
                    />
                    <div className="mt-2 flex gap-2">
                    <button
                        onClick={saveNote}
                        className="bg-white px-3 py-2 text-sm rounded-2xl shadow-sm cursor-pointer font-semibold hover:scale-102 transition-transform"
                    >
                        Сохранить
                    </button>
                    <button
                        onClick={() => setEditingId(null)}
                        className="text-sm text-gray-700 hover:text-gray-900 cursor-pointer"
                    >
                        Отмена
                    </button>
                    </div>
                </>
                ) : (
                <>
                    <h2
                    className="text-lg font-semibold text-gray-800 mb-2 cursor-pointer hover:text-blue-600"
                    onClick={() => startEditing(note)}
                    >
                    {note.title}
                    </h2>
                    <p
                    className="text-gray-600 leading-relaxed whitespace-pre-wrap cursor-pointer hover:text-blue-600"
                    onClick={() => startEditing(note)}
                    >
                    {note.content}
                    </p>
                    <button
                    onClick={() => deleteNote(note.id)}
                    className="mt-3 text-red-500 hover:text-red-700 text-sm font-medium cursor-pointer"
                    >
                    Удалить
                    </button>
                </>
                )}
            </div>
            ))}
        </Masonry>
        </div>
    )
}