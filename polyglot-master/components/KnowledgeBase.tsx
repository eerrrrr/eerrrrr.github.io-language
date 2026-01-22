
import React, { useState } from 'react';
import { VocabItem, TargetLanguage } from '../types';
import { getWordDetails, generateStoryFromVocab } from '../services/geminiService';
import VocabModal from './VocabModal';

interface KnowledgeBaseProps {
  vocab: VocabItem[];
  currentLanguage: TargetLanguage;
  onAdd: (item: Omit<VocabItem, 'id' | 'createdAt' | 'language'>) => void;
  onUpdate: (id: string, updates: Partial<VocabItem>) => void;
  onDelete: (id: string) => void;
}

const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ vocab, currentLanguage, onAdd, onUpdate, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWord, setSelectedWord] = useState<VocabItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [selectedForStory, setSelectedForStory] = useState<string[]>([]);
  const [storyContent, setStoryContent] = useState<string | null>(null);

  const handleAddWord = async () => {
    if (!newWord.trim()) return;
    setIsLoading(true);
    try {
      const details = await getWordDetails(currentLanguage, newWord);
      onAdd({
        ...details,
        isMistake: false,
        isImportant: false
      });
      setNewWord('');
    } catch (error) {
      alert('無法獲取單字詳情，請稍後再試。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateStory = async () => {
    if (selectedForStory.length < 3) {
      alert('請至少選擇 3 個單字來生成故事。');
      return;
    }
    setIsLoading(true);
    try {
      const wordsToUse = vocab.filter(v => selectedForStory.includes(v.id)).map(v => v.word);
      const story = await generateStoryFromVocab(currentLanguage, wordsToUse);
      setStoryContent(story || null);
    } catch (error) {
      alert('生成故事失敗。');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredVocab = vocab.filter(v => 
    v.word.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.translation.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">全球知識庫 ({currentLanguage})</h2>
          <p className="text-gray-500">儲存並複習你學習過的單字與表達方式。</p>
        </div>
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="新增單字..." 
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-auto"
          />
          <button 
            onClick={handleAddWord}
            disabled={isLoading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {isLoading ? <i className="fa-solid fa-spinner fa-spin"></i> : '新增'}
          </button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input 
            type="text" 
            placeholder="搜尋單字或翻譯..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <button 
          onClick={handleGenerateStory}
          disabled={selectedForStory.length < 3 || isLoading}
          className="px-6 py-3 bg-white border border-indigo-200 text-indigo-600 rounded-2xl font-semibold shadow-sm hover:bg-indigo-50 transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <i className="fa-solid fa-wand-magic-sparkles"></i>
          生成複習故事 ({selectedForStory.length})
        </button>
      </div>

      {storyContent && (
        <div className="bg-indigo-50 border border-indigo-200 p-6 rounded-2xl relative">
          <button onClick={() => setStoryContent(null)} className="absolute top-4 right-4 text-indigo-400 hover:text-indigo-600">
            <i className="fa-solid fa-times text-xl"></i>
          </button>
          <h3 className="text-lg font-bold text-indigo-800 mb-2 flex items-center gap-2">
            <i className="fa-solid fa-book-open"></i> 情境複習故事
          </h3>
          <div className="prose prose-indigo max-w-none text-indigo-900 whitespace-pre-wrap leading-relaxed">
            {storyContent}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVocab.map(item => (
          <div 
            key={item.id} 
            className={`bg-white p-5 rounded-2xl border transition shadow-sm hover:shadow-md group cursor-pointer ${
              selectedForStory.includes(item.id) ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-gray-100'
            }`}
            onClick={() => setSelectedWord(item)}
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-xl font-bold text-gray-900">{item.word}</h3>
              <div className="flex items-center gap-1">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    const newIds = selectedForStory.includes(item.id) 
                      ? selectedForStory.filter(id => id !== item.id) 
                      : [...selectedForStory, item.id];
                    setSelectedForStory(newIds);
                  }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                    selectedForStory.includes(item.id) ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-300 hover:text-indigo-500'
                  }`}
                >
                  <i className="fa-solid fa-check text-xs"></i>
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdate(item.id, { isImportant: !item.isImportant });
                  }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                    item.isImportant ? 'text-amber-500' : 'text-gray-200 hover:text-amber-400'
                  }`}
                >
                  <i className="fa-solid fa-star"></i>
                </button>
              </div>
            </div>
            
            <p className="text-gray-500 italic mb-3 line-clamp-2">{item.definition}</p>
            
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md font-medium">
                {item.translation}
              </span>
              {item.isMistake && (
                <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-md font-bold">
                  錯誤紀錄
                </span>
              )}
            </div>
          </div>
        ))}

        {filteredVocab.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <i className="fa-solid fa-box-open text-3xl"></i>
            </div>
            <h3 className="text-gray-900 font-semibold">尚無單字</h3>
            <p className="text-gray-500 mt-1">在上方輸入單字開始建立你的知識庫吧！</p>
          </div>
        )}
      </div>

      {selectedWord && (
        <VocabModal 
          item={selectedWord} 
          onClose={() => setSelectedWord(null)}
          onDelete={(id) => {
            onDelete(id);
            setSelectedWord(null);
          }}
          onToggleImportant={(id, val) => onUpdate(id, { isImportant: val })}
        />
      )}
    </div>
  );
};

export default KnowledgeBase;
