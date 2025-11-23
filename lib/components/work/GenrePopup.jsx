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
        style={{ color: '#e1cdea' }}
      >
        {name}
      </button>

      {showPopup && (
        <>
          <div
            className="fixed inset-0 z-50"
            onClick={() => setShowPopup(false)}
          />

          <div
            className="fixed z-50 rounded-lg p-4 sm:p-6 max-w-sm border-2 shadow-xl"
            style={{
              backgroundColor: '#000000',
              borderColor: '#aa51d2',
              boxShadow: '0 0 30px rgba(170, 81, 210, 0.5)',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="flex justify-between items-start mb-3">
              <h3
                className="font-bold text-lg sm:text-xl"
                style={{ color: '#e1cdea' }}
              >
                {item.name}
              </h3>
              <button
                onClick={() => setShowPopup(false)}
                className="transition"
                style={{ color: '#aa51d2' }}
              >
                <X size={20} />
              </button>
            </div>
            <p
              className="text-sm sm:text-base leading-relaxed"
              style={{ color: '#aa51d2' }}
            >
              {item.description}
            </p>
          </div>
        </>
      )}
    </>
  );
}