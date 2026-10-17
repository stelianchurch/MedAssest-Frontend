import React, { useState } from 'react';

export default function SelectOrCreate({
  label,
  value = '',
  onChange,
  options = [],
  disabled = false,
  disabledHint = '',
  placeholder = 'اختر...',
  emptyLabel = '— غير محدد —',
  required = false,
  onCreate,
  createTitle = 'إضافة جديد',
  createFieldLabel = 'الاسم',
  createPlaceholder = 'اكتب الاسم هنا...',
  createHint = '',
  createButtonText = 'حفظ',
  renderOption = (opt) => opt.name,
  getOptionValue = (opt) => opt.id,
  className = '',
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      setError('الرجاء إدخال الاسم');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const created = await onCreate(trimmed);
      if (created) {
        onChange?.(getOptionValue(created));
      }
      setNewName('');
      setDialogOpen(false);
    } catch (err) {
      setError(err?.message || 'فشل الإضافة، حاول مرة أخرى');
    } finally {
      setSaving(false);
    }
  };

  const closeDialog = () => {
    if (saving) return;
    setDialogOpen(false);
    setNewName('');
    setError('');
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-bold text-gray-700 mb-2">
          {label}{required && ' *'}
        </label>
      )}

      <div className="flex items-stretch gap-2">
        <select
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          required={required}
          className={`flex-1 min-w-0 border border-gray-300 p-2.5 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-400 outline-none ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <option value="">{placeholder || emptyLabel}</option>
          {options.map((opt) => (
            <option key={getOptionValue(opt)} value={getOptionValue(opt)}>
              {renderOption(opt)}
            </option>
          ))}
        </select>

        {onCreate && (
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            disabled={disabled}
            title="إضافة جديد"
            className={`shrink-0 w-11 flex items-center justify-center rounded-lg border font-black text-lg transition-colors ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200' : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 cursor-pointer'}`}
          >
            +
          </button>
        )}
      </div>

      {disabled && disabledHint && (
        <p className="text-[11px] text-amber-600 font-bold mt-1">{disabledHint}</p>
      )}

      {dialogOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm" dir="rtl">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-fadeIn">
            <div className="p-5 border-b border-gray-100 bg-gray-50">
              <h3 className="text-lg font-black text-gray-800">{createTitle}</h3>
            </div>

            <div className="p-5 space-y-2">
              <label className="block text-sm font-bold text-gray-700">{createFieldLabel}</label>
              <input
                type="text"
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                placeholder={createPlaceholder}
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              />
              {createHint && <p className="text-[11px] text-gray-400 font-bold">{createHint}</p>}
              {error && <p className="text-xs text-red-600 font-bold">⚠️ {error}</p>}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button
                type="button"
                onClick={handleCreate}
                disabled={saving}
                className={`flex-1 py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:-translate-y-0.5'}`}
              >
                {saving ? 'جاري الحفظ...' : createButtonText}
              </button>
              <button
                type="button"
                onClick={closeDialog}
                disabled={saving}
                className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-all cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
