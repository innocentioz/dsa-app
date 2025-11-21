'use client';

import { useState } from 'react';

interface AddTrackProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (track: { title: string; url: string; id: number }) => void; // Пример типа нового трека
}

export default function FormAddTrack({ isOpen, onClose, onAdd }: AddTrackProps) {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Введите название трека');
      return;
    }
    if (!file) {
      setError('Выберите аудиофайл');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', file);

    setUploading(true);

    try {
      const res = await fetch('/api/music', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Ошибка при загрузке');
      }

      const newTrack = await res.json();
      onAdd(newTrack); // Передаем новый трек в родительский компонент
      setTitle('');
      setFile(null);
      onClose(); // Закрываем модалку после успешной загрузки
    } catch (err) {
      console.error('Ошибка загрузки трека:', err);
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-xl max-w-md w-full shadow-2xl">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Добавить трек</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Название трека
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Введите название"
              className="w-full p-2 border border-gray-300 rounded-lg text-black"
              disabled={uploading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Аудиофайл
            </label>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
              disabled={uploading}
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={uploading || !title.trim() || !file}
              className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              {uploading ? 'Загрузка...' : 'Добавить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}