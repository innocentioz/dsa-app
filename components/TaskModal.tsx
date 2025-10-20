"use client";

import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

type FormData = {
  title: string;
  description: string;
  subject: string;
  type: string;
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

export function TaskModal({ isOpen, onClose, onCreate }: { isOpen: boolean; onClose: () => void; onCreate: () => void; }) {

  const { register, handleSubmit, reset } = useForm<FormData>({
    defaultValues: {
      title: '',
      description: '',
      subject: '',
      type: 'STUDY',
      priority: 'MEDIUM',
      status: 'ACTIVE',
      deadline: '',
      reminder: '',
      duration: '',
      isRecurring: false,
    }
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch('/api/tasks/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          duration: data.duration || null, 
        }),
      });

      if (res.ok) {
        toast.success('Задача создана!');
        reset();
        onClose();
        onCreate();
      } else {
        toast.error('Ошибка при создании');
      }
    } catch (error) {
      toast.error('Ошибка сети');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className={`
          fixed inset-0 z-50 flex items-center justify-center
          bg-black/40 backdrop-blur-sm
          transition-all duration-300 ease-out
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className={`
            relative bg-white
            rounded-2xl shadow-2xl
            w-full max-w-[95vw] sm:max-w-xl md:max-w-2xl
            mx-1 sm:mx-4
            p-2 xs:p-4 sm:p-8
            flex flex-col
            transform transition-all duration-300 ease-out
            ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
          `}
          style={{
            minHeight: 'auto',
            maxHeight: '95vh',
            overflowY: 'auto',
            boxSizing: 'border-box'
          }}
          onClick={e => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 text-black transition text-2xl sm:text-3xl cursor-pointer z-10"
            aria-label="Закрыть"
          >
            &times;
          </button>

          <h2 className="text-xl xs:text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center text-deepCocoa">
            Создать задачу
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white resize-none focus:outline-none focus:ring-2 focus:ring-deepCocoa dark:focus:ring-clashmereGlow transition text-base"
                rows={3}
                placeholder="Дополнительные детали..."
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 ">Тема</label>
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
                id="isRecurring"
                className="accent-deepCocoa dark:accent-clashmereGlow w-5 h-5 cursor-pointer"
              />
              <label htmlFor="isRecurring" className="text-sm text-gray-700 select-none">
                Повторяющаяся задача
              </label>
            </div>

            <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 col-span-1 sm:col-span-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full xs:w-auto flex-1 py-2 px-4 bg-gray-200 text-gray-800 rounded-2xl hover:bg-gray-300 transition font-semibold cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="w-full xs:w-auto flex-1 py-2 px-4 bg-deepCocoa text-clashmereGlow rounded-2xl hover:bg-opacity-90 transition font-semibold cursor-pointer"
              >
                Создать
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}