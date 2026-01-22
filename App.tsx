
import React, { useState, useEffect } from 'react';
import { TargetLanguage, VocabItem, JournalEntry, SentenceItem, GrammarItem } from './types';
import Sidebar from './components/Sidebar';
import HistoryBook from './components/HistoryBook';
import ScenarioDojo from './components/ScenarioDojo';
import Journal from './components/Journal';
import SmartQuiz from './components/SmartQuiz';
import Settings from './components/Settings';
import Dictionary from './components/Dictionary';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'history' | 'scenario' | 'journal' | 'quiz' | 'settings' | 'dictionary'>('history');
  const [currentLanguage, setCurrentLanguage] = useState<TargetLanguage>('Japanese');
  const [vocab, setVocab] = useState<VocabItem[]>([]);
  const [sentences, setSentences] = useState<SentenceItem[]>([]);
  const [grammar, setGrammar] = useState<GrammarItem[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);

  useEffect(() => {
    const savedVocab = localStorage.getItem('polyglot_vocab_v6');
    const savedSentences = localStorage.getItem('polyglot_sentences_v6');
    const savedGrammar = localStorage.getItem('polyglot_grammar_v6');
    const savedJournals = localStorage.getItem('polyglot_journals_v6');
    const savedLang = localStorage.getItem('polyglot_lang_v6');

    if (savedVocab) setVocab(JSON.parse(savedVocab));
    if (savedSentences) setSentences(JSON.parse(savedSentences));
    if (savedGrammar) setGrammar(JSON.parse(savedGrammar));
    if (savedJournals) setJournals(JSON.parse(savedJournals));
    if (savedLang) setCurrentLanguage(savedLang as TargetLanguage);
  }, []);

  useEffect(() => {
    localStorage.setItem('polyglot_vocab_v6', JSON.stringify(vocab));
    localStorage.setItem('polyglot_sentences_v6', JSON.stringify(sentences));
    localStorage.setItem('polyglot_grammar_v6', JSON.stringify(grammar));
    localStorage.setItem('polyglot_journals_v6', JSON.stringify(journals));
    localStorage.setItem('polyglot_lang_v6', currentLanguage);
  }, [vocab, sentences, grammar, journals, currentLanguage]);

  const addVocab = (item: Omit<VocabItem, 'id' | 'createdAt' | 'language'>) => {
    const newItem: VocabItem = { ...item, id: Math.random().toString(36).substr(2, 9), createdAt: Date.now(), language: currentLanguage };
    setVocab(prev => [newItem, ...prev]);
  };

  const addSentence = (original: string, translation: string, analysis: string) => {
    const newItem: SentenceItem = { id: Math.random().toString(36).substr(2, 9), original, translation, analysis, language: currentLanguage, createdAt: Date.now() };
    setSentences(prev => [newItem, ...prev]);
  };

  const addGrammar = (rule: string, explanation: string, examples: string[]) => {
    const newItem: GrammarItem = { id: Math.random().toString(36).substr(2, 9), rule, explanation, examples, language: currentLanguage, createdAt: Date.now() };
    setGrammar(prev => [newItem, ...prev]);
  };

  const factoryReset = () => {
    if (confirm('確定要恢復出廠設定嗎？這將刪除所有學習數據且無法恢復。')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const importAllData = (data: any) => {
    if (data.vocab) setVocab(data.vocab);
    if (data.sentences) setSentences(data.sentences);
    if (data.grammar) setGrammar(data.grammar);
    if (data.journals) setJournals(data.journals);
    alert('數據導入成功');
  };

  const pendingReviewCount = vocab.filter(v => v.isMistake || v.isImportant).length;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 text-slate-800">
      <Sidebar 
        activeTab={activeTab === 'settings' ? 'quiz' : activeTab as any} 
        setActiveTab={setActiveTab as any} 
        pendingCount={pendingReviewCount}
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        onOpenSettings={() => setActiveTab('settings')}
      />
      
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          {activeTab === 'dictionary' && (
            <Dictionary 
              currentLanguage={currentLanguage}
              onSaveVocab={addVocab}
              onSaveGrammar={addGrammar}
            />
          )}
          {activeTab === 'history' && (
            <HistoryBook 
              vocab={vocab.filter(v => v.language === currentLanguage)} 
              sentences={sentences.filter(s => s.language === currentLanguage)}
              grammar={grammar.filter(g => g.language === currentLanguage)}
              onAddVocab={addVocab}
              onUpdateVocab={(id, updates) => setVocab(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v))}
              onDeleteVocab={id => setVocab(prev => prev.filter(v => v.id !== id))}
              currentLanguage={currentLanguage}
            />
          )}
          {activeTab === 'scenario' && (
            <ScenarioDojo 
              currentLanguage={currentLanguage} 
              onSaveVocab={addVocab}
              onSaveSentence={addSentence}
            />
          )}
          {activeTab === 'journal' && (
            <Journal 
              currentLanguage={currentLanguage}
              journals={journals}
              onAddJournal={entry => setJournals(prev => [{ ...entry, id: Math.random().toString(36).substr(2, 9), createdAt: Date.now() }, ...prev])}
              onSaveVocab={addVocab}
            />
          )}
          {activeTab === 'quiz' && (
            <SmartQuiz 
              vocab={vocab.filter(v => v.language === currentLanguage)}
              sentences={sentences.filter(s => s.language === currentLanguage)}
              grammar={grammar.filter(g => g.language === currentLanguage)}
              onUpdateReview={(id, updates) => setVocab(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v))}
            />
          )}
          {activeTab === 'settings' && (
            <Settings 
              data={{ vocab, sentences, grammar, journals }}
              onImport={importAllData}
              onFactoryReset={factoryReset}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
