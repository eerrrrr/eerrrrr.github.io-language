
import React, { useState, useRef, useEffect } from 'react';
import { TargetLanguage, ChatMessage, WordToken, Scenario } from '../types';
import { SCENARIOS } from '../constants';
import { getTutorResponse, createCustomScenario, getWordDetails } from '../services/geminiService';
import { useAudio } from '../hooks/useAudio';

interface ScenarioDojoProps {
  currentLanguage: TargetLanguage;
  onSaveVocab: (item: any) => void;
  onSaveSentence: (original: string, trans: string, analysis: string) => void;
}

const ScenarioDojo: React.FC<ScenarioDojoProps> = ({ currentLanguage, onSaveVocab, onSaveSentence }) => {
  const [scenarios, setScenarios] = useState<Scenario[]>(SCENARIOS);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const [customSceneInput, setCustomSceneInput] = useState('');
  const [activeToken, setActiveToken] = useState<WordToken | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { speak, listen, isListening } = useAudio(currentLanguage);
  const activeScenario = scenarios.find(s => s.id === selectedScenario);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const handleCreateCustom = async () => {
    if (!customSceneInput.trim()) return;
    setIsTyping(true);
    try {
      const scene = await createCustomScenario(currentLanguage, customSceneInput);
      const newScene = { ...scene, id: 'custom-' + Date.now(), isCustom: true };
      setScenarios([newScene, ...scenarios]);
      setSelectedScenario(newScene.id);
      setCustomSceneInput('');
    } catch (e) {
      alert('無法生成場景: ' + e);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isTyping || !selectedScenario) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const response = await getTutorResponse(currentLanguage, history, userMsg.content, activeScenario?.title || 'General');
      const aiMsg: ChatMessage = { 
        id: (Date.now()+1).toString(), 
        role: 'assistant', 
        content: response.message, 
        tokens: response.tokens,
        translation: response.native_subtitle,
        correction: response.correction 
      };
      setMessages(prev => [...prev, aiMsg]);
      // Optional: Auto-speak AI reply
      speak(response.message);
    } catch (e) {
      alert('AI 連線失敗: ' + e);
    } finally {
      setIsTyping(false);
    }
  };

  const saveTokenToVocab = async (token: WordToken) => {
    const details = await getWordDetails(currentLanguage, token.text);
    onSaveVocab({ ...details, isMistake: false, isImportant: true });
    alert(`已儲存「${token.text}」到知識庫`);
  };

  if (!selectedScenario) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <header>
          <h2 className="text-3xl font-black">情境道場 (v7.0)</h2>
          <p className="text-gray-500 font-medium">自定義或選擇一個場景，與 AI 導師開始語音或文字練習。</p>
        </header>

        <div className="bg-indigo-600 p-8 rounded-[40px] text-white shadow-2xl shadow-indigo-200">
          <h3 className="text-xl font-black mb-4 flex items-center gap-2">
            <i className="fa-solid fa-wand-magic-sparkles"></i>
            自定義學習場景
          </h3>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="輸入你想練習的具體主題 (中/英/目標語皆可)..."
              value={customSceneInput}
              onChange={e => setCustomSceneInput(e.target.value)}
              className="flex-1 px-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 outline-none focus:bg-white/20 transition"
            />
            <button 
              onClick={handleCreateCustom}
              disabled={isTyping}
              className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-black hover:scale-105 active:scale-95 transition"
            >
              生成場景
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scenarios.map(s => (
            <button 
              key={s.id} 
              onClick={() => setSelectedScenario(s.id)}
              className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition text-left group"
            >
              <div className={`w-14 h-14 ${s.isCustom ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600'} rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition`}>
                <i className={`fa-solid ${s.icon} text-xl`}></i>
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{s.description}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100">
      <header className="px-8 py-6 bg-white border-b border-gray-100 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => setSelectedScenario(null)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition">
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <div>
            <h3 className="font-black text-xl">{activeScenario?.title}</h3>
            <p className="text-xs font-bold text-green-500 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span> AI 導師在線 (語音支持)
            </p>
          </div>
        </div>
        <button onClick={() => setShowCheatSheet(!showCheatSheet)} className={`px-5 py-2 rounded-2xl text-sm font-black transition ${showCheatSheet ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
          <i className="fa-solid fa-lightbulb mr-2"></i> Cheat Sheet
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50/30 relative">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8">
            {messages.map(msg => (
              <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                {msg.role === 'assistant' ? (
                  <div className="max-w-[90%] bg-white p-6 rounded-[32px] rounded-tl-none shadow-sm border border-gray-100 relative group">
                    <button 
                      onClick={() => speak(msg.content)}
                      className="absolute -right-10 top-2 text-indigo-300 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <i className="fa-solid fa-volume-high text-lg"></i>
                    </button>
                    <div className="flex flex-wrap gap-x-1 gap-y-2 mb-3">
                      {msg.tokens?.map((t, idx) => (
                        <span 
                          key={idx} 
                          onClick={() => setActiveToken(t)}
                          className="px-1 py-0.5 rounded cursor-help border-b-2 border-dashed border-indigo-200 hover:bg-indigo-50 hover:border-indigo-500 transition font-medium"
                        >
                          {t.text}
                        </span>
                      ))}
                    </div>
                    {msg.translation && <p className="text-sm text-gray-400 font-medium italic mb-2">{msg.translation}</p>}
                    <button 
                      onClick={() => onSaveSentence(msg.content, msg.translation || '', 'From Dojo Chat')}
                      className="text-[10px] font-black text-indigo-400 hover:text-indigo-600 uppercase tracking-widest flex items-center gap-1"
                    >
                      <i className="fa-solid fa-bookmark"></i> 儲存此句型
                    </button>
                  </div>
                ) : (
                  <div className="max-w-[85%] bg-indigo-600 text-white p-6 rounded-[32px] rounded-tr-none shadow-lg shadow-indigo-100 font-medium relative group">
                    <button 
                      onClick={() => speak(msg.content)}
                      className="absolute -left-10 top-2 text-indigo-300 hover:text-white/60 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <i className="fa-solid fa-volume-high text-lg"></i>
                    </button>
                    {msg.content}
                  </div>
                )}
                
                {msg.correction && (
                  <div className="mt-4 w-full max-w-[80%] bg-amber-50 border border-amber-200 p-5 rounded-[32px]">
                    <div className="flex items-center gap-2 text-amber-700 font-black text-xs mb-3 uppercase tracking-wider">
                      <i className="fa-solid fa-wand-magic-sparkles"></i> AI 語法修正建議
                    </div>
                    <p className="text-sm text-gray-500 line-through mb-1">{msg.correction.original}</p>
                    <p className="text-sm text-amber-800 font-bold mb-2">{msg.correction.suggested}</p>
                    <p className="text-xs text-amber-600/80 leading-relaxed italic">分析：{msg.correction.explanation}</p>
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-1 items-center bg-white px-6 py-4 rounded-3xl shadow-sm border border-gray-100 w-24">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-100"></span>
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-200"></span>
              </div>
            )}
          </div>

          <div className="p-8 bg-white border-t border-gray-100 shrink-0">
            <div className="flex gap-4">
              <div className="flex-1 relative flex items-center">
                <input 
                  type="text" 
                  placeholder="輸入回覆或使用麥克風..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  className="w-full px-8 py-5 pr-16 bg-slate-50 border border-slate-100 rounded-[32px] outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white transition text-lg"
                />
                <button 
                  onClick={() => listen(text => setInput(prev => prev + text))}
                  className={`absolute right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
                >
                  <i className={`fa-solid ${isListening ? 'fa-microphone-lines' : 'fa-microphone'}`}></i>
                </button>
              </div>
              <button 
                onClick={handleSendMessage}
                disabled={!input.trim() || isTyping}
                className="w-16 h-16 bg-indigo-600 text-white rounded-[32px] flex items-center justify-center shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 transition disabled:opacity-50"
              >
                <i className="fa-solid fa-paper-plane text-xl"></i>
              </button>
            </div>
          </div>
        </div>

        {showCheatSheet && (
          <aside className="w-80 border-l border-gray-100 p-8 hidden lg:block overflow-y-auto bg-white shrink-0">
            <h4 className="font-black text-slate-900 mb-6 flex items-center gap-2">
              <i className="fa-solid fa-fire text-orange-500"></i> Cheat Sheet
            </h4>
            <div className="space-y-4">
              {activeScenario?.cheatSheet.map((phrase, i) => (
                <div 
                  key={i} 
                  onClick={() => { setInput(phrase); speak(phrase); }}
                  className="p-4 bg-slate-50 rounded-2xl text-sm text-slate-700 font-bold border-2 border-transparent hover:border-indigo-500 hover:bg-white cursor-pointer transition flex justify-between items-center group"
                >
                  <span>{phrase}</span>
                  <i className="fa-solid fa-volume-low text-indigo-300 opacity-0 group-hover:opacity-100"></i>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>

      {activeToken && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-2xl w-80 border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/20 blur-3xl -z-10"></div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h5 className="text-xl font-black inline-block">{activeToken.text}</h5>
                <button onClick={() => speak(activeToken.text)} className="ml-2 text-indigo-400 hover:text-white transition">
                  <i className="fa-solid fa-volume-high text-xs"></i>
                </button>
              </div>
              <button onClick={() => setActiveToken(null)} className="text-white/40 hover:text-white transition">
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <div className="space-y-3 mb-6">
              <p className="text-sm font-bold text-indigo-400">{activeToken.def}</p>
              <div className="flex gap-2">
                <span className="px-2 py-0.5 bg-white/10 rounded text-[10px] font-black uppercase">{activeToken.pos}</span>
                <span className="px-2 py-0.5 bg-white/10 rounded text-[10px] font-black uppercase">{activeToken.grammar}</span>
              </div>
            </div>
            <button 
              onClick={() => saveTokenToVocab(activeToken)}
              className="w-full py-3 bg-indigo-600 rounded-xl font-black text-sm hover:bg-indigo-700 transition flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-plus-circle"></i> 加入知識庫
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScenarioDojo;
