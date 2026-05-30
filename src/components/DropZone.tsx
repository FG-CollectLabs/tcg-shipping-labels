import { useState, useRef, DragEvent } from 'react';

interface Props {
  label: string;
  hint: string;
  accept: string;
  onFile: (file: File) => void;
}

export default function DropZone({ label, hint, accept, onFile }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
    e.target.value = '';
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      className={`relative bg-white rounded-xl border-2 border-dashed p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors min-h-[140px] select-none ${
        dragOver
          ? 'border-indigo-400 bg-indigo-50'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
      <span className="text-2xl">📂</span>
      <p className="font-medium text-sm text-gray-700">{label}</p>
      <p className="text-xs text-gray-400 text-center">{hint}</p>
    </div>
  );
}
