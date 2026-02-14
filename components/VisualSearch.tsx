import React, { useState } from 'react';
import { Camera, X, Loader2 } from 'lucide-react';
import { Button } from './Button';

interface VisualSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (term: string) => void;
}

export const VisualSearch: React.FC<VisualSearchProps> = ({ isOpen, onClose, onSearch }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  const handleSimulatedUpload = () => {
    setIsAnalyzing(true);
    // Simulate AI Vision analysis time
    setTimeout(() => {
      setIsAnalyzing(false);
      onSearch('пионы'); // Simulated result (Translated)
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-white/50">
        <div className="p-6 border-b border-gray-200/50 flex justify-between items-center">
          <h3 className="font-serif text-xl font-medium text-emerald-900">Поиск по фото</h3>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full"><X size={20} /></button>
        </div>

        <div className="p-8">
          <div 
            className={`
              border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer
              ${dragActive ? 'border-emerald-500 bg-emerald-50/50' : 'border-gray-300 hover:border-emerald-400 hover:bg-gray-50/50'}
            `}
            onDragEnter={() => setDragActive(true)}
            onDragLeave={() => setDragActive(false)}
            onClick={handleSimulatedUpload}
          >
            {isAnalyzing ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-emerald-600" size={40} />
                <p className="font-medium text-emerald-800">Изучаем фото...</p>
                <p className="text-sm text-gray-500">ИИ анализирует сорт и цветовую гамму</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 mb-2">
                  <Camera size={32} />
                </div>
                <h4 className="font-medium text-lg text-gray-900">Загрузите изображение</h4>
                <p className="text-gray-500 text-sm max-w-xs mx-auto">
                  Перетащите фото букета, который вам понравился, или нажмите, чтобы выбрать файл.
                </p>
                <Button size="sm" variant="outline" className="mt-2">Выбрать файл</Button>
              </div>
            )}
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Популярные запросы</p>
            <div className="flex flex-wrap justify-center gap-2">
              {['Красные Розы', 'Пионы', 'Подсолнухи', 'Полевой букет'].map(term => (
                <button 
                  key={term}
                  onClick={() => { onSearch(term); onClose(); }}
                  className="px-3 py-1 bg-gray-100 hover:bg-emerald-50 text-gray-600 text-sm rounded-full transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};