// app/page.tsx
'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type Task = { id: number; title: string; completed: boolean; deadline?: string };
type Note = { id: number; title: string; content: string };

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/tasks').then(r => r.json()),
      fetch('/api/notes').then(r => r.json()),
    ]).then(([t, n]) => {
      setTasks(t);
      setNotes(n);
      setLoading(false);
    });
  }, []);

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasksCount = tasks.filter(t => t.status === 'COMPLETED').length;
  const totalTasksCount = tasks.length;
  const progressPercent = totalTasksCount > 0 ? (completedTasksCount / totalTasksCount) * 100 : 0;

  const formatDate = (isoDate?: string) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    return date.toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });
  };


  if (loading) return <div className="flex justify-center items-center min-h-screen">Загрузка...</div>;

  return (
    <div className="flex flex-col items-center px-6 py-10">
      {/* HEADER */}
      <h1 className="text-3xl md:text-4xl font-bold mb-2">🦷 Dental Study Assistant</h1>
      <p className="text-gray-600 mb-8 text-center text-base md:text-xl">
        Добро пожаловать! Сегодня у вас {pendingTasks.length} незавершённых задач и {notes.length} заметок.
      </p>

      {/* DASHBOARD GRID */}
      <div className="grid gap-6 w-full max-w-5xl md:grid-cols-2">
        {/* TASKS */}
        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
            📅 Задачи на сегодня
          </h2>
          {pendingTasks.length === 0 ? (
            <p className="text-gray-500">Все задачи выполнены 🎉</p>
          ) : (
            <ul className="space-y-2">
              {pendingTasks.slice(0, 4).map(t => (
                <li
                  key={t.id}
                  className="flex justify-between items-center border-b pb-2 last:border-none"
                >
                  <span>{t.title}</span>
                  <span className="text-sm text-gray-400">
                    {t.deadline ? `до ${formatDate(t.deadline)}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link className="mt-4 text-blue-600 hover:underline text-sm" href={'/tasks'}>Открыть все →</Link>
        </div>

        {/* NOTES */}
        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="text-xl font-semibold mb-3">🧾 Последние заметки</h2>
          {notes.length === 0 ? (
            <p className="text-gray-500">Пока нет заметок.</p>
          ) : (
            <ul className="space-y-2">
              {notes.slice(0, 4).map(n => (
                <li key={n.id} className="border-b pb-2 last:border-none">
                  <p className="font-medium">{n.title}</p>
                  <p className="text-sm text-gray-500 truncate">{n.content}</p>
                </li>
              ))}
            </ul>
          )}
          <Link className="mt-4 text-blue-600 hover:underline text-sm" href={'/notes'}>Открыть все →</Link>
        </div>
        
        <div className="bg-white rounded-2xl shadow p-5 mb-6">
          <h2 className="text-xl font-semibold mb-3">📊 Прогресс дня</h2>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-pink-500 h-4 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <p className="text-gray-500 text-sm mt-2">
            {completedTasksCount} из {totalTasksCount} задач выполнено
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-5 mb-6 flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-2">📅 Сегодня</h2>
          <div className="text-4xl font-bold">{new Date().getDate()}</div>
          <div className="text-gray-500">{new Date().toLocaleString('ru-RU', { weekday: 'long' })}</div>
        </div>

      </div>
    </div>
  );
}
