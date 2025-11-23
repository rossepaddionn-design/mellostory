'use client';
import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import genresLibrary from '@/lib/genres-library.json';

export default function TagAutocomplete({ 
  value = '', 
  onChange, 
  placeholder = 'Начните вводить...', 
  maxTags = 15 
}) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const inputRef = useRef(null);

  // Парсим текущие теги из value
  useEffect(() => {
    if (value) {
      const tags = value.split(',').map(s => s.trim()).filter(s => s);
      setSelectedTags(tags);
    } else {
      setSelectedTags([]);
    }
  }, [value]);

  // Поиск подсказок
  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);

    if (val.trim().length >= 2) {
      const filtered = genresLibrary.items.filter(item =>
        item.keywords.some(keyword => keyword.toLowerCase().includes(val.toLowerCase()))
      ).slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Добавление тега
  const addTag = (tagName) => {
    if (selectedTags.length >= maxTags) {
      alert(`Максимум ${maxTags} тегов!`);
      return;
    }

    if (!selectedTags.includes(tagName)) {
      const newTags = [...selectedTags, tagName];
      setSelectedTags(newTags);
      onChange(newTags.join(', '));
    }

    setInputValue('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Удаление тега
  const removeTag = (tagToRemove) => {
    const newTags = selectedTags.filter(t => t !== tagToRemove);
    setSelectedTags(newTags);
    onChange(newTags.join(', '));
  };

  return (
    <div className="relative">
      {/* Выбранные теги */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedTags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm"
              style={{
                backgroundColor: '#e1cdea',
                color: '#000000'
              }}
            >
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="hover:opacity-70 transition"
                type="button"
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Поле ввода */}
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => inputValue.length >= 2 && setShowSuggestions(true)}
        placeholder={placeholder}
        className="w-full bg-gray-800 border border-gray-700 rounded px-3 sm:px-4 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-purple-500"
        disabled={selectedTags.length >= maxTags}
      />

      {/* Подсказки */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800 border-2 border-purple-500 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {suggestions.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => addTag(item.name)}
              className="w-full px-4 py-3 text-left hover:bg-gray-700 transition text-white border-b border-gray-700 last:border-b-0"
            >
              <div className="font-semibold text-sm" style={{ color: '#e1cdea' }}>
                {item.name}
              </div>
              <div className="text-xs text-gray-400 mt-1 line-clamp-2">
                {item.description}
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedTags.length >= maxTags && (
        <p className="text-xs text-yellow-500 mt-1">
          Достигнут лимит: {maxTags} тегов
        </p>
      )}
    </div>
  );
}