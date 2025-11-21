// components/MusicPlayer.tsx (обновленный)
'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Pause, Play, Trash, Volume2, VolumeX } from 'lucide-react';
import FormAddTrack from '@/components/FormAddTrack'; // Импортируем новый компонент

const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || seconds === Infinity) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export default function MusicPlayer() {
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- ШТАТЫ ДЛЯ МОДАЛКИ ---
  const [showAddModal, setShowAddModal] = useState(false);

  const currentTrack = tracks[currentTrackIndex];

  // ───────────────────────
  // 1. Загрузка треков с API
  // ───────────────────────
  useEffect(() => {
    const loadTracks = async () => {
      try {
        const res = await fetch('/api/music');
        const data = await res.json();
        setTracks(data);
      } catch (error) {
        console.error("Ошибка загрузки трека:", error instanceof Error ? error.message : error);
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadTracks();
  }, []);

  // ────────────────
  // 2. Синхрон громкости
  // ────────────────
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // ────────────────
  // 3. Прогресс
  // ────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      if (audio.duration && !isNaN(audio.currentTime)) {
        setDuration(audio.duration);
        setProgress(audio.currentTime / audio.duration);
      }
    };

    const setAudioDuration = () => {
      setDuration(audio.duration || 0);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', setAudioDuration);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', setAudioDuration);
    };
  }, [currentTrack]);

  // ────────────────
  // 4. Play / Pause
  // ────────────────
  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        alert('Браузер заблокировал воспроизведение. Нажмите Play вручную.');
        console.error('Playback failed:', error);
      }
    }
  };

  // ────────────────
  // 5. Следующий трек
  // ────────────────
  const playNextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
    setIsPlaying(true);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.load();

    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    }
  }, [currentTrackIndex]);

  const handleTrackSelect = (index: number) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
  };

  // ────────────────
  // 6. Перемотка
  // ────────────────
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseFloat(e.target.value);
    setProgress(newProgress);
    if (audioRef.current && !isNaN(duration)) {
      audioRef.current.currentTime = newProgress * duration;
    }
  };

  const playPrevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    setIsPlaying(true);
  };

  const playNextManual = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
    setIsPlaying(true);
  };

  // ───────────────────────────────
  // 7. Обработчик добавления трека из модалки
  // ───────────────────────────────
  const handleAddTrack = (newTrack: any) => {
    setTracks((prev) => [...prev, newTrack]);
  };

  const deleteTrack = async (id: number) => {
    if (!confirm("Удалить трек?")) return;

    try {
      const res = await fetch(`/api/music/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Ошибка удаления");

      setTracks((prev) => prev.filter((t) => t.id !== id));

      if (tracks.length === 1) {
        // Если удалили последний трек, сбросим индекс
        setCurrentTrackIndex(0);
      } else if (currentTrackIndex >= tracks.length - 1) {
        // Если удалили последний в списке и это был текущий
        setCurrentTrackIndex(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Ошибка удаления трека:", error);
      alert("Не удалось удалить трек");
    }
  };

  if (loading) {
    return <div className="text-white p-4">Загрузка...</div>;
  }

  return (
    <div className="text-white flex flex-col justify-between p-4 gap-6">
      {/* Кнопка для открытия модалки */}
      {/* 🎵 Список треков */}
      <div className="bg-white/50 rounded-xl p-4 w-full shadow-2xl overflow-y-scroll max-h-96">
        <div className='flex justify-between items-center'>
          <h4 className="text-base font-semibold text-black mb-2">Список треков:</h4>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-pink-500 hover:bg-pink-600 text-white rounded-xl py-2 px-4 mb-2 flex items-center justify-center shadow-lg cursor-pointer transition-all"
          >
            Добавить трек
          </button>
        </div>
        <ul className="space-y-2">
          {tracks.length === 0 ? (
            <li className="text-black/70 text-sm italic">Нет загруженных треков</li>
          ) : (
            tracks.map((track, index) => (
              <li
                key={track.id}
                onClick={() => handleTrackSelect(index)}
                className={`p-1.5 rounded-lg cursor-pointer transition flex items-center justify-between gap-1 text-black 
                  hover:bg-gray-400/10
                  ${ index === currentTrackIndex
                    ? 'bg-pink-600/50 border-l-2 border-pink-400 text-white hover:bg-pink-600/50'
                    : ''
                }`}
              >
                <div className='flex items-center space-x-1'>
                  <span>{index + 1}.</span>
                  <span className="font-medium text-sm">{track.title}</span>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTrack(track.id);
                  }}
                  className={` hover:scale-105 transition-all text-sm font-bold cursor-pointer
                    ${index === currentTrackIndex ? '' : 'text-red-600 hover:text-red-800'}
                    `}
                >
                  <Trash />
                </button>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* 🕹️ Панель */}
      <div className="w-full bg-white/30 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-white/10">
        {currentTrack ? (
          <div className="w-full backdrop-blur-lg rounded-2xl overflow-hidden border border-white/10">
            <div className="p-6 text-center border-b border-white/10">
              <h3 className="text-xl mt-2 font-semibold text-deepCocoa truncate">
                {currentTrack.title}
              </h3>
            </div>
          </div>
        ) : (
          <div className="text-white p-4 bg-white/20 rounded-xl text-center">
            Нет треков для воспроизведения
          </div>
        )}

        <div className="p-6 flex flex-col items-center space-y-6">

          <div className="flex space-x-4">
            <button onClick={playPrevTrack} className="text-black cursor-pointer">
              <ArrowLeft />
            </button>

            <button
              onClick={togglePlay}
              className="bg-pink-500 hover:bg-pink-600 text-white p-4 rounded-full w-16 h-16 flex items-center justify-center text-xl font-bold transition cursor-pointer"
            >
              {isPlaying ? <Pause /> : <Play />}
            </button>

            <button onClick={playNextManual} className="text-black cursor-pointer">
              <ArrowRight />
            </button>
          </div>

          {/* Прогресс */}
          <div className="w-full max-w-xl">
            <div className="flex justify-between text-xs text-deepCocoa mb-1">
              <span>{formatTime(progress * duration)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.001"
              value={progress}
              onChange={handleSeek}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
            />
          </div>

          {/* Громкость */}
          <div className="w-42 flex items-center space-x-6">
            {volume === 0 ? <VolumeX color="black" size={32}/> : <Volume2 color="black" size={32}/>}
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
            />
          </div>
        </div>
      </div>

      {/* Аудио */}
      {currentTrack && (
        <audio
          ref={audioRef}
          src={currentTrack.url}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={playNextTrack}
        />
      )}

      {/* Модалка добавления трека */}
      <FormAddTrack
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddTrack}
      />
    </div>
  );
}