
import React, { useState } from 'react';
import { TargetLanguage, DictionaryResult } from '../types';
import { getDictionaryLookup, getWordDetails } from '../services/geminiService';
import { useAudio } from '../hooks/useAudio';

interface DictionaryProps {
  currentLanguage: TargetLanguage;
  onSaveVocab: (item: any) => void;
  onSaveGrammar: (rule: string, explanation: string, examples: string[]) => void;
}

const Dictionary: React.FC<DictionaryProps> = ({ currentLanguage, onSaveVocab, onSaveGrammar }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DictionaryResult | null>(null);

  const { speak, listen, isListening } = useAudio(currentLanguage);

  const handleLookup = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    setResult(null);
    try {
      const data = await getDictionaryLookup(currentLanguage, query);
      setResult(data);
    } catch (e) {
      alert('查詢失敗: ' + e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveWord = async () => {
    if (!result) return;
    setIsLoading(true);
    try {
      const details = await getWordDetails(currentLanguage, result.term);
      onSaveVocab({ ...details, isMistake: false, isImportant: true });
      alert(`已儲存「${result.term}」到單詞本`);
    } catch (e) {
      alert('儲存失敗');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveGrammar = () => {
    if (!result) return;
    onSaveGrammar(result.term, result.definition, [result.example]);
    alert(`已儲存「${result.term}」到語法本`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-black text-slate-900">AI 語境詞典</h2>
        <p className="text-gray-500 font-medium">支持語音搜尋與朗讀，提供最深度的語言解析。</p>
      </header>

      <div className="relative group">
        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
          <i className="fa-solid fa-magnifying-glass text-slate-300 group-focus-within:text-indigo-500 transition-colors"></i>
        </div>
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
          placeholder="輸入單字、語法或點擊右側語音圖示..."
          className="w-full pl-14 pr-44 py-5 bg-white border border-slate-100 rounded-[32px] shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all text-lg font-medium"
        />
        <div className="absolute right-3 top-2 bottom-2 flex gap-2">
           <button 
            onClick={() => listen(text => setQuery(prev => prev + text))}
            className={`w-12 rounded-[18px] flex items-center justify-center transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
          >
            <i className={`fa-solid ${isListening ? 'fa-microphone-lines' : 'fa-microphone'}`}></i>
          </button>
          <button 
            onClick={handleLookup}
            disabled={isLoading}
            className="px-8 bg-indigo-600 text-white rounded-[24px] font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition-all"
          >
            {isLoading ? <i className="fa-solid fa-spinner fa-spin"></i> : '查詢'}
          </button>
        </div>
      </div>

      {result && (
        <div className="bg-white p-10 rounded-[40px] shadow-xl border border-slate-50 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-4">
              <div>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest mb-3 inline-block">
                  {result.pos}
                </span>
                <div className="flex items-center gap-4">
                  <h3 className="text-5xl font-black text-slate-900">{result.term}</h3>
                  <button 
                    onClick={() => speak(result.term)}
                    className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition shadow-sm"
                  >
                    <i className="fa-solid fa-volume-high"></i>
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleSaveWord}
                className="p-4 bg-slate-50 text-slate-600 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                title="存入單詞本"
              >
                <i className="fa-solid fa-plus-circle mr-2"></i>
                存入單詞
              </button>
              <button 
                onClick={handleSaveGrammar}
                className="p-4 bg-slate-50 text-slate-600 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                title="存入語法本"
              >
                <i className="fa-solid fa-bookmark mr-2"></i>
                存入語法
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-black text-slate-300 uppercase tracking-widest mb-3">核心定義</h4>
                <p className="text-xl text-slate-700 font-medium leading-relaxed">
                  {result.definition}
                </p>
              </div>
              
              {result.example && (
                <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 relative group">
                  <button 
                    onClick={() => speak(result.example)}
                    className="absolute right-4 top-4 text-indigo-300 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition"
                  >
                    <i className="fa-solid fa-volume-high"></i>
                  </button>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">範例應用</h4>
                  <p className="text-lg font-bold text-slate-800 italic">
                    {result.example}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {result.related_grammar && (
                <div className="p-8 bg-indigo-50 rounded-[40px] border border-indigo-100">
                  <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4">關聯語法規則</h4>
                  <p className="text-slate-700 font-medium leading-relaxed">
                    {result.related_grammar}
                  </p>
                </div>
              )}

              {result.related_vocab && result.related_vocab.length > 0 && (
                <div>
                  <h4 className="text-xs font-black text-slate-300 uppercase tracking-widest mb-3">關聯詞彙</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.related_vocab.map((v, i) => (
                      <span 
                        key={i} 
                        onClick={() => speak(v)}
                        className="px-4 py-2 bg-white border border-slate-100 rounded-xl text-sm font-bold text-slate-600 hover:border-indigo-200 hover:text-indigo-600 transition-colors cursor-pointer flex items-center gap-2 group"
                      >
                        {v}
                        <i className="fa-solid fa-volume-low text-indigo-200 group-hover:text-indigo-500"></i>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!result && !isLoading && (
        <div className="flex flex-col items-center justify-center py-20 opacity-20">
          <i className="fa-solid fa-feather-pointed text-8xl mb-6"></i>
          <p className="text-xl font-black">輸入任何詞彙或使用語音開始探索</p>
        </div>
      )}
    </div>
  );
};

export default Dictionary;
