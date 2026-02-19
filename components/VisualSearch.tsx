
import React, { useState, useRef } from 'react';
import { Camera, X, Loader2, UploadCloud, Image as ImageIcon } from 'lucide-react';
import { Button } from './Button';
import { identifyPlantFromImage } from '../services/geminiService';

interface VisualSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (term: string) => void;
}

export const VisualSearch: React.FC<VisualSearchProps> = ({ isOpen, onClose, onSearch }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFile = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
        alert("Пожалуйста, выберите изображение.");
        return;
    }

    // Show preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setIsAnalyzing(true);

    try {
      // Convert to Base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64Data = base64String.split(',')[1];
        
        const result = await identifyPlantFromImage(base64Data, file.type);
        
        setIsAnalyzing(false);
        if (result && result.searchTerm) {
           onSearch(result.searchTerm);
           onClose();
        } else {
           alert("Не удалось распознать цветок. Попробуйте другое фото.");
           setPreviewUrl(null);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      setIsAnalyzing(false);
      setPreviewUrl(null);
      alert("Произошла ошибка при обработке изображения.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
    // Reset input value to allow selecting the same file again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-white/50 relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-white rounded-full transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="p-6 border-b border-gray-200/50">
          <h3 className="font-serif text-xl font-medium text-emerald-900">Поиск по фото</h3>
        </div>

        <div className="p-8">
          <div 
            className={`
              relative overflow-hidden
              border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer
              ${dragActive ? 'border-emerald-500 bg-emerald-50/50' : 'border-gray-300 hover:border-emerald-400 hover:bg-gray-50/50'}
              ${previewUrl ? 'border-none p-0' : ''}
            `}
            onDragEnter={onDrag}
            onDragLeave={onDrag}
            onDragOver={onDrag}
            onDrop={onDrop}
            onClick={previewUrl ? undefined : handleButtonClick}
          >
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/png, image/jpeg, image/webp, image/heic"
              className="hidden" 
              onChange={handleFileChange}
            />

            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center min-h-[200px] bg-emerald-50/50">
                <Loader2 className="animate-spin text-emerald-600 mb-4" size={40} />
                <p className="font-medium text-emerald-800">Flora изучает ваше фото...</p>
                <p className="text-sm text-gray-500">Определяем сорт и оттенки</p>
              </div>
            ) : previewUrl ? (
              <div className="relative h-[300px] w-full group">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <p className="text-white font-medium">Нажмите, чтобы выбрать другое</p>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); setPreviewUrl(null); }}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full text-sm font-medium shadow-lg"
                >
                  Сбросить
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 mb-2">
                  <UploadCloud size={32} />
                </div>
                <h4 className="font-medium text-lg text-gray-900">Загрузите изображение</h4>
                <p className="text-gray-500 text-sm max-w-xs mx-auto">
                  Перетащите фото букета сюда или нажмите для выбора
                </p>
                <Button size="sm" variant="outline" className="mt-2" onClick={(e) => { e.stopPropagation(); handleButtonClick(); }}>
                  Выбрать файл
                </Button>
              </div>
            )}
          </div>

          {!isAnalyzing && !previewUrl && (
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Или попробуйте найти</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['Красные Розы', 'Пионы', 'Подсолнухи', 'Кактус'].map(term => (
                  <button 
                    key={term}
                    onClick={(e) => { e.stopPropagation(); onSearch(term); onClose(); }}
                    className="px-3 py-1 bg-gray-100 hover:bg-emerald-50 text-gray-600 text-sm rounded-full transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
