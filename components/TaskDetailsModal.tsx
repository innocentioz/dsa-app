// components/TaskDetailsModal.tsx
'use client';

import { Task } from '@prisma/client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

type FormData = {
  title: string;
  description: string;
  subject: string;
  type: 'STUDY' | 'PRACTICE' | 'EXAM' | 'TEST' | 'CONSULTATION' | 'ABSTRACT' | 'PRESENTATION' | 'REPEAT';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'ACTIVE' | 'COMPLETED' | 'POSTPONED' | 'CANCELLED';
  deadline: string;
  reminder: string;
  duration: number | '';
  isRecurring: boolean;
};

const TASK_TYPES = [
  { value: 'STUDY', label: 'Учить теорию' },
  { value: 'PRACTICE', label: 'Практиковать навыки' },
  { value: 'EXAM', label: 'Подготовка к экзамену' },
  { value: 'TEST', label: 'Пройти тест' },
  { value: 'CONSULTATION', label: 'Приём пациентов' },
  { value: 'ABSTRACT', label: 'Написать конспект' },
  { value: 'PRESENTATION', label: 'Подготовить доклад' },
  { value: 'REPEAT', label: 'Повторение' },
];

export function TaskDetailsModal({
  isOpen,
  onClose,
  task,
  onUpdate,
}: {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onUpdate: () => void;
}) {
  const { register, handleSubmit, reset } = useForm<FormData>();

  useEffect(() => {
    if (isOpen && task) {
      reset({
        title: task.title,
        description: task.description || '',
        subject: task.subject || '',
        type: task.type || 'STUDY',
        priority: task.priority,
        status: task.status,
        deadline: task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : '',
        reminder: task.reminder ? new Date(task.reminder).toISOString().slice(0, 16) : '',
        duration: task.duration || '',
        isRecurring: task.isRecurring,
      });
    }
  }, [isOpen, task, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch('/api/tasks/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: task.id,
          title: data.title,
          description: data.description || null,
          subject: data.subject || null,
          type: data.type,
          priority: data.priority,
          status: data.status,
          deadline: data.deadline ? new Date(data.deadline) : null,
          reminder: data.reminder ? new Date(data.reminder) : null,
          duration: typeof data.duration === 'number' ? data.duration : null,
          isRecurring: data.isRecurring,
        }),
      });

      if (res.ok) {
        toast.success('Задача обновлена!');
        onClose();
        onUpdate();
      } else {
        const error = await res.json();
        toast.error(`Ошибка: ${error.message || 'Неизвестная ошибка'}`);
        console.error('Ошибка обновления:', error);
      }
    } catch (error: any) {
      toast.error('Ошибка сети: ' + error.message);
      console.error('Fetch error:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className={`
          fixed inset-0 z-50 flex items-center justify-center
          bg-black/40 backdrop-blur-sm
          transition-all duration-300 ease-out
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
      >
        <div
          className={`
            relative bg-white
            rounded-3xl shadow-2xl
            w-full max-w-lg sm:max-w-xl md:max-w-2xl
            mx-2 sm:mx-4
            p-2 xs:p-3 sm:p-6 md:p-8
            flex flex-col
            transform transition-all duration-300 ease-out
            ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
          `}
          style={{
            maxHeight: '95vh',
            overflowY: 'auto',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-700 dark:hover:text-white transition text-2xl sm:text-3xl"
            aria-label="Закрыть"
          >
            &times;
          </button>

          <h2 className="text-xl xs:text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center text-deepCocoa dark:text-clashmereGlow">
            Редактировать задачу
          </h2>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
          >
            <div className="flex flex-col gap-2 col-span-1 sm:col-span-2">
              <label className="text-sm font-medium text-gray-700">Название</label>
              <input
                type="text"
                {...register('title', { required: 'Обязательное поле' })}
                className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-deepCocoa dark:focus:ring-clashmereGlow transition text-base"
                placeholder="Введите название"
              />
            </div>

            <div className="flex flex-col gap-2 col-span-1 sm:col-span-2">
              <label className="text-sm font-medium text-gray-700">Описание</label>
              <textarea
                {...register('description')}
                className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-deepCocoa dark:focus:ring-clashmereGlow transition resize-none text-base"
                rows={3}
                placeholder="Описание задачи"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Тема</label>
              <input
                type="text"
                {...register('subject')}
                className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-deepCocoa dark:focus:ring-clashmereGlow transition text-base"
                placeholder="Гистология и т.д."
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Тип задачи</label>
              <select
                {...register('type')}
                className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-deepCocoa dark:focus:ring-clashmereGlow transition text-base"
              >
                {TASK_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Приоритет</label>
              <select
                {...register('priority')}
                className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-deepCocoa dark:focus:ring-clashmereGlow transition text-base"
              >
                <option value="LOW">Низкий</option>
                <option value="MEDIUM">Средний</option>
                <option value="HIGH">Высокий</option>
                <option value="URGENT">Срочно</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Срок выполнения</label>
              <input
                type="datetime-local"
                {...register('deadline')}
                className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-deepCocoa dark:focus:ring-clashmereGlow transition text-base"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Напомнить в</label>
              <input
                type="datetime-local"
                {...register('reminder')}
                className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-deepCocoa dark:focus:ring-clashmereGlow transition text-base"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Длительность (мин)</label>
              <input
                type="number"
                {...register('duration', { valueAsNumber: true })}
                className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-deepCocoa dark:focus:ring-clashmereGlow transition text-base"
                placeholder="Например: 60"
                min={0}
              />
            </div>

            <div className="flex items-center gap-2 col-span-1 sm:col-span-2 mt-2">
              <input
                type="checkbox"
                {...register('isRecurring')}
                id="isRecurringEdit"
                className="accent-deepCocoa dark:accent-clashmereGlow w-5 h-5"
              />
              <label htmlFor="isRecurringEdit" className="text-sm text-gray-700 select-none">
                Повторяющаяся задача
              </label>
            </div>

            <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 col-span-1 sm:col-span-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full xs:w-auto flex-1 py-2 px-4 bg-gray-200 dark:bg-neutral-700 text-gray-800 dark:text-gray-100 rounded-2xl hover:bg-gray-300 dark:hover:bg-neutral-600 transition font-semibold"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="w-full xs:w-auto flex-1 py-2 px-4 bg-deepCocoa text-clashmereGlow rounded-2xl hover:bg-opacity-90 transition font-semibold"
              >
                Сохранить
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}