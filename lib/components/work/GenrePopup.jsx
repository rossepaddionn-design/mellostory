'use client';
import { useState } from 'react';
import { X } from 'lucide-react';
import genresLibrary from '@/lib/genres-library.json';

export default function GenreTag({ name }) {
  const [showPopup, setShowPopup] = useState(false);

  const item = genresLibrary.items.find(i => i.name === name);

  if (!item) {
    return <span style={{ color: '#e1cdea' }}>{name}</span>;
  }

  return (
    <>
      <button
        onClick={() => setShowPopup(true)}
        className="hover:underline cursor-pointer transition"
        style={{ color: '#ffffff' }}
      >
        {name}
      </button>

      {showPopup && (
        <>
          <div
            className="fixed inset-0 z-50"
            onClick={() => setShowPopup(false)}
          />

// Изменить стили модального окна:
<div
  className="fixed z-50 rounded-lg p-4 sm:p-6 max-w-sm border-2 shadow-xl"
  style={{
    backgroundColor: '#000000',
    borderColor: '#a6a0a6',
    boxShadow: 'none',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)'
  }}
>
  <div className="flex justify-between items-start mb-3">
    <h3
      className="font-bold text-lg sm:text-xl underline" 
      style={{ color: '#8a8a8a' }}
    >
      {item.name}
    </h3>
    <button
      onClick={() => setShowPopup(false)}
      className="transition"
      style={{ color: '#a6a0a6' }} 
    >
      <X size={20} />
    </button>
  </div>
  <p
    className="text-sm sm:text-base leading-relaxed"
    style={{ color: '#ffffff' }}
  >
    • {item.description}
  </p>
</div>
        </>
      )}
    </>
  );
}