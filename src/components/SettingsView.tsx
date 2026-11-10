import React, { useState } from 'react';
import { 
  Save, 
  Download, 
  Upload, 
  CheckCircle2, 
  Database 
} from 'lucide-react';
import { AppStorage } from '../services/storage';
import { UserSettings } from '../types';

export const SettingsView: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>(() => AppStorage.getSettings());
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    AppStorage.saveSettings(settings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExportData = () => {
    const jsonStr = AppStorage.exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `govt_job_prep_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = AppStorage.importData(content);
      if (success) {
        setImportStatus('Backup data restored successfully! Reloading...');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setImportStatus('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111418]">
          Preferences & Examination Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B]">
          Configure daily targets, negative marking deductions, and database backups.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-[#EAE3DC] rounded-3xl p-6 sm:p-8 space-y-6 text-xs shadow-xs">
        <div className="space-y-3 border-b border-[#F1EAE5] pb-5">
          <label className="text-sm font-bold text-[#111418] uppercase block">
            Daily Target Mode
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[45, 50].map(val => (
              <button
                key={val}
                type="button"
                onClick={() => setSettings({ ...settings, dailyTarget: val })}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  settings.dailyTarget === val 
                    ? 'bg-[#111418] text-white border-[#111418]' 
                    : 'bg-[#F8F5F2] text-[#64748B] border-[#EAE3DC]'
                }`}
              >
                <div className="text-base font-bold">{val} MCQs / day</div>
                <div className="text-[11px] opacity-80 mt-1">
                  {val === 45 ? '15 Bangla • 10 Math • 10 GK • 10 English' : 'Extended 50 Question Set'}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 border-b border-[#F1EAE5] pb-5">
          <label className="text-sm font-bold text-[#111418] uppercase block">
            Negative Marking Deductions
          </label>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enableNegativeMarking}
              onChange={e => setSettings({ ...settings, enableNegativeMarking: e.target.checked })}
              className="w-4 h-4 accent-[#111418]"
            />
            <span className="text-sm text-[#111418] font-medium">
              Enable Negative Marking on incorrect answers
            </span>
          </label>

          {settings.enableNegativeMarking && (
            <div className="flex gap-3 pt-2">
              {[0.25, 0.50].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setSettings({ ...settings, negativeMarkValue: val })}
                  className={`px-4 py-2 rounded-full border text-xs font-bold ${
                    settings.negativeMarkValue === val
                      ? 'bg-[#111418] text-white border-[#111418]'
                      : 'bg-[#F8F5F2] text-[#64748B] border-[#EAE3DC]'
                  }`}
                >
                  -{val} Marks ({val === 0.5 ? 'BCS Standard' : 'Bank Standard'})
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          {savedSuccess && (
            <span className="text-[#10B981] flex items-center gap-1.5 font-bold">
              <CheckCircle2 size={16} /> Saved successfully!
            </span>
          )}
          <button
            type="submit"
            className="ml-auto flex items-center space-x-2 px-6 py-3 rounded-full bg-[#111418] text-white font-bold text-xs hover:bg-[#20232A] cursor-pointer shadow-xs"
          >
            <Save size={14} />
            <span>Save Settings</span>
          </button>
        </div>
      </form>

      {/* Database Backup & Export */}
      <div className="bg-white border border-[#EAE3DC] rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
        <h2 className="text-base font-bold text-[#111418] flex items-center space-x-2">
          <Database size={18} className="text-[#10B981]" />
          <span>Local IndexedDB Database & Portability</span>
        </h2>
        <p className="text-xs text-[#64748B]">
          All exam sessions, past scores, mistake notebooks, and question banks are stored permanently in your local browser database with 100% free offline persistence.
        </p>

        {importStatus && (
          <div className="p-3 rounded-xl bg-green-50 text-green-700 text-xs font-bold">
            {importStatus}
          </div>
        )}

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={handleExportData}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-full bg-[#F8F5F2] hover:bg-[#F1EAE5] text-[#111418] border border-[#EAE3DC] text-xs font-bold cursor-pointer"
          >
            <Download size={14} />
            <span>Export Database (JSON)</span>
          </button>

          <label className="flex items-center space-x-2 px-5 py-2.5 rounded-full bg-[#F8F5F2] hover:bg-[#F1EAE5] text-[#111418] border border-[#EAE3DC] text-xs font-bold cursor-pointer">
            <Upload size={14} />
            <span>Restore from File</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
