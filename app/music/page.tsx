'use client';

import { useState, useRef, useEffect } from 'react';
import { sounds } from '@/data/sounds';
import { ArrowLeft, ArrowRight, Pause, Play, Volume2, VolumeX } from 'lucide-react';

const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || seconds === Infinity) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = sounds[currentTrackIndex];

  // 🎚️ Синхронизация громкости
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // 📈 Обновление прогресса
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

  // ▶️ Переключение воспроизведения
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

  // ⏭️ Следующий трек после окончания
  const playNextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % sounds.length);
    setIsPlaying(true);
  };

  // 🔁 Автоматическое воспроизведение при смене трека
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.load(); // перезагружаем источник

    if (isPlaying) {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch((error) => {
          console.warn('Не удалось воспроизвести новый трек:', error);
          setIsPlaying(false);
        });
    }
  }, [currentTrackIndex]);

  // 📀 Выбор трека из списка
  const handleTrackSelect = (index: number) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
  };

  // ⏩ Перемотка
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseFloat(e.target.value);
    setProgress(newProgress);
    if (audioRef.current && !isNaN(duration)) {
      audioRef.current.currentTime = newProgress * duration;
    }
  };

  // ⏮️ ⏭️ Переключение вручную
  const playPrevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + sounds.length) % sounds.length);
    setIsPlaying(true);
  };

  const playNextManual = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % sounds.length);
    setIsPlaying(true);
  };

  return (
    <div className="text-white flex flex-col justify-between p-4 gap-6">
      {/* 🎵 Список треков */}
      <div className="bg-white/50 rounded-xl p-4 w-full shadow-2xl overflow-y-scroll max-h-96">
        <h4 className="text-base font-semibold text-black mb-2">Список треков:</h4>
        <ul className="space-y-2">
          {sounds.map((track, index) => (
            <li
              key={index}
              onClick={() => handleTrackSelect(index)}
              className={`p-1.5 rounded-lg cursor-pointer transition flex items-center gap-1 text-black ${
                index === currentTrackIndex
                  ? 'bg-pink-600/50 border-l-2 border-pink-400 text-white'
                  : ''
              }`}
            >
              <span>{track.id}.</span>
              <span className="font-medium text-sm">{track.title}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 🕹️ Панель управления */}
      <div className="w-full bg-white/30 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-white/10">
        <div className="p-6 text-center border-b border-white/10">
          <h3 className="text-xl mt-2 font-semibold text-deepCocoa truncate">
            {currentTrack.title}
          </h3>
        </div>

        <div className="p-6 flex flex-col items-center space-y-6">
          {/* ▶️ Кнопки управления */}
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

          {/* ⏱️ Прогресс */}
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

          {/* 🔊 Громкость */}
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

      {/* 🎧 Аудиоэлемент */}
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={playNextTrack}
      />
    </div>
  );
}
