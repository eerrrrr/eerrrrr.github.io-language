
import React, { useState, useMemo } from 'react';
import { VocabItem, SentenceItem, GrammarItem } from '../types';

interface SmartQuizProps {
  vocab: VocabItem[];
  sentences: SentenceItem[];
  grammar: GrammarItem[];
  onUpdateReview: (id: string, updates: Partial<VocabItem>) => void;
}

const SmartQuiz: React.FC<SmartQuizProps> = ({ vocab, sentences, grammar, onUpdateReview }) => {
  const [config, setConfig] = useState({
    includeVocab: true,
    includeSentences: false,
    includeGrammar: false,
    onlyImportant: true,
    onlyMistakes: false,
  });
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  const quizItems = useMemo(() => {
    let pool: any[] = [];
    if (config.includeVocab) pool = [...pool, ...vocab];
    if (config.includeSentences) pool = [...pool, ...sentences];
    if (config.includeGrammar) pool = [...pool, ...grammar];

    if (config.onlyImportant) pool = pool.filter(item => (item as VocabItem).isImportant || (item as any).rule);
    if (config.onlyMistakes) pool = pool.filter(item => (item as VocabItem).isMistake);

    return pool.sort(() => Math.random() - 0.5);
  }, [quizStarted]);

  const currentItem = quizItems[currentIndex];

  const handleNext = (remembered: boolean) => {
    if (remembered && (currentItem as VocabItem).id) {
      onUpdateReview((currentItem as VocabItem).id, { isMistake: false });
    }
    
    if (currentIndex < quizItems.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      setSessionCompleted(true);
    }
  };

  if (!quizStarted) {
    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-in zoom-in duration-300">
        <header className="text-center">
          <div className="w-20 h-20 bg-indigo-600 text-white rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-100">
            <i className="fa-solid fa-bolt-lightning text-3xl"></i>
          </div>
          <h2 className="text-4xl font-black text-slate-900">智慧複習設定</h2>
          <p className="text-gray-500 mt-2">根據你的掌握情況自定義本次測驗。</p>
        </header>

        <div className="bg-white p-10 rounded-[40px] shadow-xl border border-slate-50 space-y-10">
          <section>
            <h4 className="text-xs font-black text-slate-300 uppercase tracking-widest mb-6">包含內容</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'includeVocab', label: '單詞', icon: 'fa-font' },
                { id: 'includeSentences', label: '句型', icon: 'fa-align-left' },
                { id: 'includeGrammar', label: '語法', icon: 'fa-scroll' },
              ].map(opt => (
                <button 
                  key={opt.id}
                  onClick={() => setConfig(prev => ({ ...prev, [opt.id]: !prev[opt.id as keyof typeof prev] }))}
                  className={`flex flex-col items-center justify-center p-6 rounded-[32px] border-2 transition-all ${
                    config[opt.id as keyof typeof config] 
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-600' 
                      : 'border-slate-50 bg-slate-50 text-slate-400'
                  }`}
                >
                  <i className={`fa-solid ${opt.icon} text-xl mb-3`}></i>
                  <span className="font-bold">{opt.label}</span>
                </button>
              ))}
            </div>
          </section>

          <section>
            <h4 className="text-xs font-black text-slate-300 uppercase tracking-widest mb-6">過濾器</h4>
            <div className="flex gap-4">
              <button 
                onClick={() => setConfig(prev => ({ ...prev, onlyImportant: !prev.onlyImportant }))}
                className={`flex-1 py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 border-2 transition-all ${
                  config.onlyImportant ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-slate-50 text-slate-400'
                }`}
              >
                <i className="fa-solid fa-star"></i>
                僅限重點項目
              </button>
              <button 
                onClick={() => setConfig(prev => ({ ...prev, onlyMistakes: !prev.onlyMistakes }))}
                className={`flex-1 py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 border-2 transition-all ${
                  config.onlyMistakes ? 'border-red-400 bg-red-50 text-red-700' : 'border-slate-50 text-slate-400'
                }`}
              >
                <i className="fa-solid fa-circle-exclamation"></i>
                僅限錯誤紀錄
              </button>
            </div>
          </section>

          <button 
            onClick={() => setQuizStarted(true)}
            className="w-full py-6 bg-slate-900 text-white rounded-[32px] font-black text-xl hover:bg-black transition-all shadow-xl shadow-slate-100"
          >
            開始複習
          </button>
        </div>
      </div>
    );
  }

  if (quizItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[40px] border border-slate-50 shadow-sm text-center px-6">
        <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6">
          <i className="fa-solid fa-check-double text-4xl"></i>
        </div>
        <h3 className="text-3xl font-black text-slate-900 mb-2">太輕鬆了！</h3>
        <p className="text-gray-500 mb-8 max-w-sm">所選的過濾條件下沒有需要複習的項目。請調整設定或繼續學習新知識。</p>
        <button onClick={() => setQuizStarted(false)} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold">返回設定</button>
      </div>
    );
  }

  if (sessionCompleted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[40px] border border-slate-50 shadow-sm text-center px-6">
        <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <i className="fa-solid fa-graduation-cap text-4xl"></i>
        </div>
        <h3 className="text-3xl font-black text-slate-900 mb-2">複習完成！</h3>
        <p className="text-gray-500 mb-8">你已經完成了本次的所有待複習項目，這對你的長期記憶很有幫助。</p>
        <button onClick={() => {
            setCurrentIndex(0);
            setIsFlipped(false);
            setSessionCompleted(false);
            setQuizStarted(false);
          }}
          className="px-12 py-5 bg-indigo-600 text-white rounded-[24px] font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition"
        >
          返回大廳
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-in slide-in-from-bottom-4">
      <header className="flex justify-between items-center px-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">複習中...</h2>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">
            {(currentItem as any).rule ? '語法模式' : (currentItem as any).original ? '句型模式' : '單詞模式'}
          </p>
        </div>
        <div className="bg-indigo-50 px-5 py-2 rounded-full text-indigo-600 font-black text-xs">
          {currentIndex + 1} / {quizItems.length}
        </div>
      </header>

      <div className="relative h-[450px] perspective">
        <div 
          onClick={() => setIsFlipped(!isFlipped)}
          className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d cursor-pointer ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Front */}
          <div className="absolute inset-0 backface-hidden bg-white rounded-[48px] shadow-2xl border border-indigo-50 flex flex-col items-center justify-center p-12 text-center">
            <span className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.3em] mb-8">挑戰內容</span>
            <h3 className="text-6xl font-black text-slate-900 mb-6 tracking-tight">
              {(currentItem as VocabItem).word || (currentItem as SentenceItem).original || (currentItem as GrammarItem).rule}
            </h3>
            <p className="text-indigo-600 font-bold mb-8">{(currentItem as VocabItem).pronunciation || ''}</p>
            <div className="mt-auto flex items-center gap-3 text-slate-300 font-bold text-xs">
              <i className="fa-solid fa-rotate"></i>
              點擊翻面查看解析
            </div>
          </div>

          {/* Back */}
          <div className="absolute inset-0 backface-hidden bg-white rounded-[48px] shadow-2xl border-2 border-indigo-600 flex flex-col p-10 rotate-y-180">
            <div className="flex justify-between items-start mb-8">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">解答解析</span>
              <div className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-black">
                {(currentItem as VocabItem).translation || (currentItem as SentenceItem).translation || '語法解析'}
              </div>
            </div>
            
            <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
              <p className="text-2xl text-slate-800 font-bold leading-relaxed border-l-8 border-indigo-500 pl-6 py-2">
                "{(currentItem as VocabItem).definition || (currentItem as GrammarItem).explanation}"
              </p>
              
              {((currentItem as VocabItem).example || (currentItem as SentenceItem).analysis) && (
                <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">語境範例</p>
                  <p className="text-slate-700 font-medium italic">{(currentItem as VocabItem).example || (currentItem as SentenceItem).analysis}</p>
                </div>
              )}
            </div>

            <div className="mt-8 flex gap-4 pt-6 border-t border-slate-100">
              <button 
                onClick={(e) => { e.stopPropagation(); handleNext(false); }}
                className="flex-1 py-5 bg-slate-50 text-slate-400 rounded-2xl font-bold hover:bg-red-50 hover:text-red-500 transition-all"
              >
                還不熟
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); handleNext(true); }}
                className="flex-1 py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
              >
                記住了！
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .perspective { perspective: 2000px; }
        .transform-style-preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default SmartQuiz;
