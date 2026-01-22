
import React from 'react';
import { VocabItem } from '../types';

interface VocabModalProps {
  item: VocabItem;
  onClose: () => void;
  onDelete: (id: string) => void;
  onToggleImportant: (id: string, val: boolean) => void;
}

const VocabModal: React.FC<VocabModalProps> = ({ item, onClose, onDelete, onToggleImportant }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-4xl font-extrabold text-gray-900 mb-1">{item.word}</h2>
              <div className="flex items-center gap-2 text-indigo-600 font-medium">
                <i className="fa-solid fa-volume-high"></i>
                <span>{item.pronunciation || '無音標紀錄'}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => onToggleImportant(item.id, !item.isImportant)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition border ${
                  item.isImportant ? 'bg-amber-50 border-amber-200 text-amber-500' : 'bg-white border-gray-200 text-gray-300 hover:text-amber-400'
                }`}
              >
                <i className="fa-solid fa-star"></i>
              </button>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition"
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm font-bold mb-3">
                {item.translation}
              </div>
              <p className="text-gray-700 italic text-lg leading-relaxed border-l-4 border-indigo-500 pl-4">
                "{item.definition}"
              </p>
            </div>

            {item.collocations && item.collocations.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">常用搭配 (Collocations)</h4>
                <div className="flex flex-wrap gap-2">
                  {item.collocations.map((col, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-medium">
                      {col}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">語境提示 (Context)</h4>
              <p className="text-gray-600 text-sm">{item.context || '無特定語境資訊'}</p>
            </div>

            {item.example && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">例句</h4>
                <p className="text-slate-700 font-medium leading-relaxed italic">
                  {item.example}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
          <p className="text-xs text-gray-400">建立於 {new Date(item.createdAt).toLocaleDateString()}</p>
          <button 
            onClick={() => {
              if (confirm('確定要刪除這個單字嗎？')) {
                onDelete(item.id);
              }
            }}
            className="text-red-400 hover:text-red-600 text-sm font-medium transition flex items-center gap-1"
          >
            <i className="fa-solid fa-trash-can text-xs"></i>
            刪除單字
          </button>
        </div>
      </div>
    </div>
  );
};

export default VocabModal;
