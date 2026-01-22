
import React, { useState } from 'react';
import { TargetLanguage, JournalEntry, VocabItem } from '../types';
import { getJournalAnalysis } from '../services/geminiService';
import { useAudio } from '../hooks/useAudio';

interface JournalProps {
  currentLanguage: TargetLanguage;
  journals: JournalEntry[];
  onAddJournal: (entry: Omit<JournalEntry, 'id' | 'createdAt'>) => void;
  onSaveVocab: (item: any) => void;
}

const Journal: React.FC<JournalProps> = ({ currentLanguage, journals, onAddJournal, onSaveVocab }) => {
  const [content, setContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const { speak, listen, isListening } = useAudio(currentLanguage);

  const handleAnalyze = async () => {
    if (!content.trim()) return;
    setIsAnalyzing(true);
    try {
      const analysis = await getJournalAnalysis(currentLanguage, content);
      setResult(analysis);
      onAddJournal({
        original: content,
        optimized: analysis.optimized,
        analysis: analysis.analysis,
        vocabSuggestions: analysis.vocabSuggestions
      });
    } catch (error) {
      alert('分析失敗: ' + error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-black">母語日記 (v7.0)</h2>
        <p className="text-gray-500">支持語音輸入日記，由 AI 轉化為最道地的母語表達。</p>
      </header>

      <div className="bg-white p-10 rounded-[40px] shadow-2xl shadow-slate-100 border border-gray-50 relative overflow-hidden">
        <div className="mb-8 relative">
          <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">今日記錄 / 想說的話</label>
          <textarea 
            rows={5}
            placeholder="今天我想點一份義大利麵，但我不知道怎麼說..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-[32px] p-8 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white transition text-xl font-medium leading-relaxed"
          ></textarea>
          <button 
            onClick={() => listen(text => setContent(prev => prev + (prev ? ' ' : '') + text))}
            className={`absolute right-6 bottom-6 w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-indigo-600 hover:bg-indigo-50 border border-slate-100'}`}
          >
            <i className={`fa-solid ${isListening ? 'fa-microphone-lines text-xl' : 'fa-microphone text-xl'}`}></i>
          </button>
        </div>
        <button 
          onClick={handleAnalyze}
          disabled={!content.trim() || isAnalyzing}
          className="w-full py-6 bg-slate-900 text-white rounded-[32px] font-black text-xl hover:bg-black active:scale-[0.98] transition flex items-center justify-center gap-3 shadow-xl shadow-slate-200 disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <i className="fa-solid fa-compass fa-spin"></i>
              正在編寫道地版本...
            </>
          ) : (
            <>
              <i className="fa-solid fa-magic"></i>
              母語化優化分析
            </>
          )}
        </button>
      </div>

      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-8">
          <div className="bg-indigo-600 p-10 rounded-[48px] text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl -z-0"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-sm font-black text-white/60 uppercase tracking-widest flex items-center gap-2">
                  <i className="fa-solid fa-crown"></i> 母語優化版 (Optimized)
                </h3>
                <button 
                  onClick={() => speak(result.optimized)}
                  className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition shadow-sm"
                >
                  <i className="fa-solid fa-volume-high"></i>
                </button>
              </div>
              <p className="text-4xl font-black leading-tight mb-10">
                {result.optimized}
              </p>
              
              <div className="bg-black/20 p-8 rounded-[32px] border border-white/10">
                <h4 className="text-xs font-black text-white/60 uppercase tracking-widest mb-4">AI 教學分析</h4>
                <p className="text-lg font-medium opacity-90 leading-relaxed">
                  {result.analysis}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100">
              <h4 className="font-black text-xl mb-8 flex items-center gap-3 text-slate-900">
                <i className="fa-solid fa-lightbulb text-amber-400"></i>
                關鍵表達提取
              </h4>
              <div className="space-y-6">
                {result.vocabSuggestions?.map((vocab: any, i: number) => (
                  <div key={i} className="flex items-start justify-between p-4 hover:bg-slate-50 rounded-[24px] transition group border border-transparent hover:border-slate-100">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-black text-lg text-slate-800">{vocab.word}</p>
                        <button onClick={() => speak(vocab.word)} className="text-indigo-300 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition">
                          <i className="fa-solid fa-volume-high text-xs"></i>
                        </button>
                      </div>
                      <p className="text-sm text-indigo-500 font-bold mb-1">{vocab.translation}</p>
                      <p className="text-xs text-gray-400 font-medium italic">"{vocab.example}"</p>
                    </div>
                    <button 
                      onClick={() => onSaveVocab({
                        ...vocab,
                        isMistake: false,
                        isImportant: true
                      })}
                      className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-sm"
                    >
                      <i className="fa-solid fa-plus"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-slate-50 p-10 rounded-[40px] flex flex-col justify-center items-center text-center">
              <div className="w-20 h-20 bg-white rounded-[32px] flex items-center justify-center text-indigo-600 text-3xl shadow-sm mb-6">
                <i className="fa-solid fa-award"></i>
              </div>
              <h4 className="text-2xl font-black text-slate-900 mb-2">掌握度提升！</h4>
              <p className="text-gray-500 font-medium px-6 leading-relaxed">用語音重複朗讀優化後的句子，能有效提升語感與發音。</p>
            </div>
          </div>
        </div>
      )}

      {journals.length > 0 && !result && (
        <div className="space-y-6 pt-8">
          <h4 className="font-black text-slate-900 text-xl px-4">過往寫作紀錄</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {journals.map(j => (
              <div key={j.id} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition group">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{new Date(j.createdAt).toLocaleDateString()}</p>
                  <button onClick={() => speak(j.optimized)} className="text-indigo-300 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition">
                    <i className="fa-solid fa-volume-high"></i>
                  </button>
                </div>
                <p className="text-sm text-gray-400 line-clamp-2 mb-4 font-medium italic">"{j.original}"</p>
                <p className="text-xl font-black text-indigo-600 leading-tight">{j.optimized}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Journal;
