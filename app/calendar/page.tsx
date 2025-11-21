'use client';

import { Flower } from 'lucide-react';
import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

// Универсальный тип
type Value = Date | [Date | null, Date | null] | null;

export default function FancyCalendar() {
  const [date, setDate] = useState<Value>(new Date());

  return (
    <div className="from-pink-50 via-white to-pink-50 p-8 rounded-3xl shadow-2xl max-w-md mx-auto border border-pink-100">
      <h2 className="flex items-center justify-center gap-3 text-2xl font-extrabold text-center mb-6 bg-clip-text text-pink-500 from-pink-500 to-pink-400">
        <Flower size={36} color='pink'/> Календарь
      </h2>
      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-inner border border-pink-100">
        <Calendar
          onChange={setDate}
          value={date}
          className="react-calendar mx-auto"
          tileClassName={({ date, view }) =>
            view === 'month' && date.getDay() === 0 ? 'sunday-highlight' : ''
          }
          locale="ru-RU"
          selectRange={false}
        />
      </div>
      <p className="mt-4 text-center text-pink-700 font-medium">
        Выбрано:{' '}
        {date instanceof Date
          ? date.toLocaleDateString('ru-RU', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          : Array.isArray(date)
          ? `${date[0]?.toLocaleDateString('ru-RU')} — ${date[1]?.toLocaleDateString('ru-RU')}`
          : '—'}
      </p>
    </div>
  );
}