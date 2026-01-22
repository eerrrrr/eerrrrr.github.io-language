
import React, { useState } from 'react';
import { VocabItem, SentenceItem, GrammarItem, TargetLanguage } from '../types';
import { getWordDetails } from '../services/geminiService';
import VocabModal from './VocabModal';
import { useAudio } from '../hooks/useAudio';

interface HistoryBookProps {
  vocab: VocabItem[];
  sentences: SentenceItem[];
  grammar: GrammarItem[];
  currentLanguage: TargetLanguage;
  onAddVocab: (item: any) => void;
  onUpdateVocab: (id: string, updates: any) => void;
  onDeleteVocab: (id: string) => void;
}

const HistoryBook: React.FC<HistoryBookProps> = ({ vocab, sentences, grammar, currentLanguage, onAddVocab, onUpdateVocab, onDeleteVocab }) => {
  const [activeSubTab, setActiveSubTab] = useState<'vocab' | 'sentence' | 'grammar'>('vocab');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWord, setSelectedWord] = useState<VocabItem | null>(null);
  const [newInput, setNewInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { speak } = useAudio(currentLanguage);

  const handleQuickAdd = async () => {
    if (!newInput.trim()) return;
    setIsLoading(true);
    try {
      const details = await getWordDetails(currentLanguage, newInput);
      onAddVocab({ ...details, isMistake: false, isImportant: false });
      setNewInput('');
    } catch (e) {
      alert('無法獲取詳情: ' + e);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredVocab = vocab.filter(v => v.word.includes(searchTerm) || v.translation.includes(searchTerm));
  const filteredSentences = sentences.filter(s => s.original.includes(searchTerm) || s.translation.includes(searchTerm));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900">歷史紀錄 (v7.0)</h2>
          <p className="text-gray-500 font-medium">所有保存的單詞與句型，皆可點擊朗讀。</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
          {(['vocab', 'sentence', 'grammar'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeSubTab === tab ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab === 'vocab' ? '單詞' : tab === 'sentence' ? '句型' : '語法'}
            </button>
          ))}
        </div>
      </header>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
          <input 
            type="text" 
            placeholder="搜尋..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
          />
        </div>
        {activeSubTab === 'vocab' && (
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="快速新增單字..." 
              value={newInput}
              onChange={e => setNewInput(e.target.value)}
              className="px-4 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
            <button 
              onClick={handleQuickAdd}
              disabled={isLoading}
              className="px-6 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50"
            >
              {isLoading ? <i className="fa-solid fa-spinner fa-spin"></i> : '新增'}
            </button>
          </div>
        )}
      </div>

      {activeSubTab === 'vocab' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVocab.map(item => (
            <div key={item.id} onClick={() => setSelectedWord(item)} className="bg-white p-6 rounded-3xl border border-gray-50 shadow-sm hover:shadow-xl transition cursor-pointer group relative">
              <button 
                onClick={(e) => { e.stopPropagation(); speak(item.word); }}
                className="absolute right-4 top-4 text-indigo-300 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition"
              >
                <i className="fa-solid fa-volume-high"></i>
              </button>
              <div className="flex justify-between items-start mb-2 pr-6">
                <h4 className="text-xl font-black text-slate-800">{item.word}</h4>
                <div className="flex gap-1">
                  {item.isImportant && <i className="fa-solid fa-star text-amber-400"></i>}
                  {item.isMistake && <i className="fa-solid fa-circle-exclamation text-red-400"></i>}
                </div>
              </div>
              <p className="text-indigo-600 font-bold text-sm mb-4">{item.translation}</p>
              <p className="text-gray-400 text-sm line-clamp-2 italic">"{item.definition}"</p>
            </div>
          ))}
        </div>
      )}

      {activeSubTab === 'sentence' && (
        <div className="space-y-4">
          {filteredSentences.map(item => (
            <div key={item.id} className="bg-white p-6 rounded-3xl border border-gray-50 shadow-sm hover:border-indigo-200 transition group relative">
              <button 
                onClick={(e) => { e.stopPropagation(); speak(item.original); }}
                className="absolute right-6 top-6 text-indigo-300 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition"
              >
                <i className="fa-solid fa-volume-high text-xl"></i>
              </button>
              <div className="flex justify-between items-start mb-2 pr-10">
                <p className="text-xl font-bold text-slate-800">{item.original}</p>
                <span className="text-[10px] text-gray-300 font-bold uppercase shrink-0">{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-indigo-600 font-bold mb-4">{item.translation}</p>
              <div className="bg-indigo-50 p-4 rounded-2xl text-sm text-indigo-900 border-l-4 border-indigo-400">
                <p className="font-semibold mb-1">AI 解析：</p>
                {item.analysis}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeSubTab === 'grammar' && (
        <div className="space-y-4">
          {grammar.map(item => (
            <div key={item.id} className="bg-white p-8 rounded-3xl border border-gray-50 shadow-sm">
              <h4 className="text-2xl font-black text-slate-900 mb-2">{item.rule}</h4>
              <p className="text-gray-600 mb-6 leading-relaxed">{item.explanation}</p>
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">應用範例</p>
                {item.examples.map((ex, i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-xl text-slate-700 font-medium flex justify-between items-center group">
                    <span>{ex}</span>
                    <button onClick={() => speak(ex)} className="text-indigo-300 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition">
                      <i className="fa-solid fa-volume-high"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedWord && (
        <VocabModal 
          item={selectedWord} 
          onClose={() => setSelectedWord(null)}
          onDelete={onDeleteVocab}
          onToggleImportant={(id, val) => onUpdateVocab(id, { isImportant: val })}
        />
      )}
    </div>
  );
};

export default HistoryBook;
