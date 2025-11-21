'use client';

import { Pause, Play, RotateCcw } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

export default function Timer() {
  const [hours, setHours] = useState<string>('');
  const [minutes, setMinutes] = useState<string>('');
  const [seconds, setSeconds] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Создаём элемент <audio> один раз
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/sounds/timer-end.mp3');
      // Опционально: предзагрузка
      audioRef.current.load();
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playSound = () => {
    if (audioRef.current) {
      // Сброс позиции на начало (на случай повторного использования)
      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .catch((err) => {
          // Игнорируем ошибку, если звук заблокирован (например, без взаимодействия с пользователем)
          console.warn('Не удалось воспроизвести звук:', err);
        });
    }
  };

  const handleSetTimer = () => {
    const h = hours === '' ? 0 : parseInt(hours, 10);
    const m = minutes === '' ? 0 : parseInt(minutes, 10);
    const s = seconds === '' ? 0 : parseInt(seconds, 10);

    if (
      isNaN(h) || isNaN(m) || isNaN(s) ||
      h < 0 || m < 0 || s < 0 ||
      m >= 60 || s >= 60
    ) {
      toast.warn('Пожалуйста, введите корректное время (минуты и секунды от 0 до 59)');
      return;
    }

    const totalSeconds = h * 3600 + m * 60 + s;
    if (totalSeconds <= 0) {
      toast.warn('Таймер должен быть больше 0 секунд');
      return;
    }

    setTimeLeft(totalSeconds);
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startTimer = () => {
    if (timeLeft > 0) {
      setIsRunning(true);
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(0);
    setHours('');
    setMinutes('');
    setSeconds('');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            playSound();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, timeLeft]);

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600)
      .toString()
      .padStart(2, '0');
    const mins = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  return (
    <div className="flex justify-center bg-linear-to-br">
      <div className="bg-white rounded-2xl shadow-xl p-12 w-full max-w-md text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Интерактивный таймер</h2>

        {/* Ввод времени */}
        <div className="mb-6 flex flex-col justify-center items-center gap-6">
          <div className='flex items-center gap-3'>
            <input
              type="number"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="Ч"
              min="0"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-center w-16"
            />
            <span className="text-gray-600">:</span>
            <input
              type="number"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              placeholder="М"
              min="0"
              max="59"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-center w-16"
            />
            <span className="text-gray-600">:</span>
            <input
              type="number"
              value={seconds}
              onChange={(e) => setSeconds(e.target.value)}
              placeholder="С"
              min="0"
              max="59"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-center w-16"
            />
          </div>  
          <button
            onClick={handleSetTimer}
            className="bg-bareVeile text-white py-3 px-10 rounded-2xl shadow-sm cursor-pointer font-semibold hover:scale-102 transition-transform"
          >
            Установить
          </button>
        </div>

        {/* Отображение времени */}
        <div className="text-4xl md:text-5xl font-mono font-bold text-gray-800 mb-8 tracking-wider">
          {formatTime(timeLeft)}
        </div>

        {/* Кнопки управления */}
        <div className="flex justify-center gap-6 mt-4">
          <button
            onClick={startTimer}
            disabled={isRunning || timeLeft === 0}
            className={`
              p-3 rounded-full bg-dustyRose text-white
              transition-all duration-200 ease-in-out
              hover:scale-105
              active:scale-95 focus:outline-none focus:ring-2 focus:ring-dustyRose
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
              shadow-md hover:shadow-lg
            `}
            aria-label="Старт"
          >
            <Play size={24} />
          </button>

          <button
            onClick={pauseTimer}
            disabled={!isRunning}
            className={`
              p-3 rounded-full bg-deepCocoa text-white
              transition-all duration-200 ease-in-out
              hover:scale-105
              active:scale-95 focus:outline-none focus:ring-2 focus:ring-deepCocoa
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
              shadow-md hover:shadow-lg
            `}
            aria-label="Пауза"
          >
            <Pause size={24} />
          </button>

          <button
            onClick={resetTimer}
            className={`
              p-3 rounded-full bg-amber-950/40 text-white
              transition-all duration-200 ease-in-out
              hover:scale-105
              active:scale-95 focus:outline-none focus:ring-2 focus:ring-bareVeile
              shadow-md hover:shadow-lg
            `}
            aria-label="Сброс"
          >
            <RotateCcw size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}