
import React, { useRef } from 'react';

interface SettingsProps {
  data: any;
  onImport: (data: any) => void;
  onFactoryReset: () => void;
}

const Settings: React.FC<SettingsProps> = ({ data, onImport, onFactoryReset }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportData = () => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `polyglot-v7-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        onImport(parsed);
      } catch (err) {
        alert('無效的 JSON 檔案');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-black text-slate-900">系統設定</h2>
        <p className="text-gray-500 font-medium">配置數據備份與重置 (v7.0)。</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 flex flex-col h-full">
          <h3 className="text-xl font-black mb-6 flex items-center gap-2">
            <i className="fa-solid fa-database text-indigo-600"></i>
            數據管理
          </h3>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            導出或導入您的學習數據。數據僅儲存在您的瀏覽器本地 (localStorage)。
          </p>
          <div className="space-y-4">
            <button 
              onClick={exportData}
              className="flex items-center justify-center gap-3 w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition"
            >
              <i className="fa-solid fa-file-export"></i>
              導出備份 (JSON)
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-3 w-full py-4 bg-white border-2 border-slate-900 text-slate-900 rounded-2xl font-bold hover:bg-slate-50 transition"
            >
              <i className="fa-solid fa-file-import"></i>
              導入備份
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImport} 
              className="hidden" 
              accept=".json"
            />
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 flex flex-col h-full">
          <h3 className="text-xl font-black mb-6 flex items-center gap-2 text-red-600">
            <i className="fa-solid fa-trash-can"></i>
            重置
          </h3>
          <p className="text-gray-400 text-sm mb-8 leading-relaxed">
            恢復出廠設定將徹底清空所有學習數據與配置。此操作無法撤銷。
          </p>
          <button 
            onClick={onFactoryReset}
            className="mt-auto flex items-center justify-center gap-3 w-full py-4 bg-red-50 text-red-600 border-2 border-red-100 rounded-2xl font-bold hover:bg-red-600 hover:text-white transition-all"
          >
            恢復出廠設定 (Factory Reset)
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
