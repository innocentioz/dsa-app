"use client";

import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { TaskModal } from '@/components/TaskModal';
import { TaskDetailsModal } from '@/components/TaskDetailsModal';

type Task = {
  id: number;
  title: string;
  description: string | null;
  subject: string | null;
  type: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'ACTIVE' | 'COMPLETED' | 'POSTPONED' | 'CANCELLED';
  deadline: string | null;
  reminder: string | null;
  duration: number | null;
  isRecurring: boolean;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  reminderSent: boolean;
};

const TASK_TYPE_LABELS: Record<string, string> = {
  STUDY: 'Учить теорию',
  PRACTICE: 'Практиковать навыки',
  EXAM: 'Подготовка к экзамену',
  TEST: 'Пройти тест',
  CONSULTATION: 'Приём пациентов',
  ABSTRACT: 'Написать конспект',
  PRESENTATION: 'Подготовить доклад',
  REPEAT: 'Повторение',
};

const PRIORITY_CONFIG = {
  LOW: { label: 'Низкий', bgColor: 'bg-champacnePink', textColor: 'text-deepCocoa' },
  MEDIUM: { label: 'Средний', bgColor: 'bg-clashmereGlow', textColor: 'text-deepCocoa' },
  HIGH: { label: 'Высокий', bgColor: 'bg-dustyRose', textColor: 'text-deepCocoa' },
  URGENT: { label: 'Срочно', bgColor: 'bg-deepCocoa', textColor: 'text-clashmereGlow' },
} as const;

const COLUMNS = [
  { status: 'ACTIVE', title: 'В процессе'},
  { status: 'COMPLETED', title: 'Готово'},
  { status: 'POSTPONED', title: 'Отложено'},
  { status: 'CANCELLED', title: 'Отменено'},
] as const;

export default function Tasks() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    useEffect(() => {
        const loadTasks = async () => {
        const res = await fetch("/api/tasks");
        const data = await res.json();
        setTasks(data);
        };
        loadTasks();
    }, []);

    const groupedTasks = {
        ACTIVE: tasks.filter(t => t.status === 'ACTIVE'),
        POSTPONED: tasks.filter(t => t.status === 'POSTPONED'),
        CANCELLED: tasks.filter(t => t.status === 'CANCELLED'),
        COMPLETED: tasks.filter(t => t.status === 'COMPLETED'),
    };

    const updateTaskStatus = async (id: number, newStatus: Task['status']) => {
        await fetch('/api/tasks/update/status', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status: newStatus }),
        });
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    };

    const deleteTask = async (id: number) => {
        await fetch('/api/tasks/delete', {
            method: "DELETE",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        })
        setTasks(prev => prev.filter(task => task.id !== id));
        toast.success("Задача успешно удалена");
    }

    const handleCreateTask = () => {
      const loadTasks = async () => {
        const res = await fetch("/api/tasks");
        const data = await res.json();
        setTasks(data);
      };
      loadTasks();
    };

  return (
    <div className="p-6 text-warmGray">
      <h2 className="text-2xl font-bold mb-6">Твои задачи</h2>
      <h3 className="text-xl font-bold mb-6"> Всего задач: {tasks.length}</h3>

      <div className='mb-6'>
        <button className='bg-white py-3 px-10 rounded-2xl shadow-sm cursor-pointer font-semibold hover:scale-102 transition-transform'
          onClick={() => setIsModalOpen(true)}
        >
            Добавить задачу
        </button>
      </div>

      <div className="flex gap-12 h-[calc(80vh-120px)] overflow-x-auto">
        {COLUMNS.map((column) => (
          <TaskColumn
            key={column.status}
            column={column}
            tasks={groupedTasks[column.status]}
            onUpdateStatus={updateTaskStatus}
            onDelete={deleteTask}
            onSelectTask={setSelectedTask}
          />
        ))}
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateTask}
      />

      <TaskDetailsModal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        task={selectedTask! as any}
        onUpdate={handleCreateTask} // можно переиспользовать — перезагружает задачи
      />
    </div>
  );
}

function TaskColumn({
  column,
  tasks,
  onUpdateStatus,
  onDelete,
  onSelectTask,
}: {
  column: (typeof COLUMNS)[number];
  tasks: Task[];
  onUpdateStatus: (id: number, status: Task['status']) => void;
  onDelete: (id: number) => void;
  onSelectTask: (task: Task) => void;
}) {
  const onDragOver = (e: React.DragEvent) => e.preventDefault();
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const id = Number(e.dataTransfer.getData("task-id"));
    onUpdateStatus(id, column.status);
  };

  return (
    <div
      className="shrink-0 w-80 bg-white rounded-2xl p-3 overflow-y-scroll custom-scrollbar"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <h3
        className={`text-lg font-bold px-3 py-1 rounded mb-3 flex items-center gap-2`}
      >
        {column.title}: {tasks.length}
      </h3>
      <div className="space-y-7 min-h-32">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onDelete={onDelete} onSelect={() => onSelectTask(task)}/>
        ))}
      </div>
    </div>
  );
}

function TaskCard({ task, onDelete, onSelect }: { task: Task, onDelete: (id: number) => void; onSelect: () => void;}) {
  const onDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("task-id", String(task.id));
  };

  const handleDelete = async (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault()  
      onDelete(task.id); 
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="bg-white p-4 rounded-2xl shadow-lg hover:scale-103 transition-transform font-semibold"
      onClick={onSelect}
    >
      <h4 className="text-base">{task.title}</h4>
      {task.subject && <p className="text-sm mt-1">{task.subject}</p>}

      <div className="mt-2 flex justify-between items-center">
        <span
          className={`text-xs px-3 py-1 rounded-2xl ${PRIORITY_CONFIG[task.priority]?.bgColor} ${PRIORITY_CONFIG[task.priority]?.textColor}`}
        >
          {PRIORITY_CONFIG[task.priority]?.label}
        </span>
        {task.deadline && (
          <span className="text-xs text-gray-400">
            Срок задачи: {new Date(task.deadline).toLocaleDateString('ru')}
          </span>
        )}
        <button className='cursor-pointer' onClick={handleDelete}><Trash2 color='red' size={20}/></button>
      </div>
    </div>
  );
}