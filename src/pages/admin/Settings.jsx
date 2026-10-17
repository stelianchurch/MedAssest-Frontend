import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ConfirmModal from '../../components/ui/ConfirmModal';
import {
  fetchParishes,
  createParish,
  updateParish,
  deleteParish,
  fetchPriests,
  createPriest,
  updatePriest,
  deletePriest
} from '../../services/api';
import { useToast } from '../../hooks/useToast';

const emptyPriestForm = { name: '', parish_ids: [] };

export default function Settings() {
  const { toast, showNotification } = useToast();

  const [parishes, setParishes] = useState([]);
  const [priests, setPriests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Parish states
  const [newParishName, setNewParishName] = useState('');
  const [isSubmittingParish, setIsSubmittingParish] = useState(false);
  const [editingParish, setEditingParish] = useState(null); // { id, name }
  const [editParishName, setEditParishName] = useState('');

  // Priest states
  const [priestForm, setPriestForm] = useState(emptyPriestForm);
  const [isSubmittingPriest, setIsSubmittingPriest] = useState(false);
  const [editingPriestId, setEditingPriestId] = useState(null);

  // Delete modal
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, type: null, id: null, name: '' });
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async (signal = null) => {
    setLoading(true);
    try {
      const [parishesData, priestsData] = await Promise.all([
        fetchParishes(signal),
        fetchPriests(signal)
      ]);
      if (signal?.aborted) return;
      setParishes(parishesData);
      setPriests(priestsData);
      setError(null);
    } catch (err) {
      if (signal?.aborted) return;
      setError(err.message || 'فشل جلب البيانات');
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  };

  useEffect(() => {
    const abortController = new AbortController();
    loadData(abortController.signal);
    return () => abortController.abort();
  }, []);

  // ── Parish handlers ──
  const handleAddParish = async () => {
    const name = newParishName.trim();
    if (!name) return showNotification('الرجاء إدخال اسم الرعية', 'error');
    setIsSubmittingParish(true);
    try {
      await createParish({ name });
      showNotification(`تم إضافة رعية "${name}" بنجاح`);
      setNewParishName('');
      await loadData();
    } catch (err) {
      showNotification(err.message || 'فشل إضافة الرعية', 'error');
    } finally {
      setIsSubmittingParish(false);
    }
  };

  const handleUpdateParish = async () => {
    const name = editParishName.trim();
    if (!name) return showNotification('الرجاء إدخال اسم الرعية', 'error');
    try {
      await updateParish(editingParish.id, { name });
      showNotification('تم تحديث الرعية بنجاح');
      setEditingParish(null);
      setEditParishName('');
      await loadData();
    } catch (err) {
      showNotification(err.message || 'فشل تحديث الرعية', 'error');
    }
  };

  // ── Priest handlers ──
  const togglePriestParish = (id) => {
    setPriestForm((prev) => {
      const has = prev.parish_ids.includes(id);
      return {
        ...prev,
        parish_ids: has ? prev.parish_ids.filter((p) => p !== id) : [...prev.parish_ids, id]
      };
    });
  };

  const startEditPriest = (priest) => {
    setEditingPriestId(priest.id);
    setPriestForm({
      name: priest.name,
      parish_ids: (priest.parishes || []).map((p) => p.id)
    });
  };

  const cancelPriestForm = () => {
    setEditingPriestId(null);
    setPriestForm(emptyPriestForm);
  };

  const handleSubmitPriest = async () => {
    const name = priestForm.name.trim();
    if (!name) return showNotification('الرجاء إدخال اسم الكاهن', 'error');
    if (priestForm.parish_ids.length === 0) return showNotification('يجب اختيار رعية واحدة على الأقل', 'error');

    setIsSubmittingPriest(true);
    try {
      if (editingPriestId) {
        await updatePriest(editingPriestId, { name, parish_ids: priestForm.parish_ids });
        showNotification('تم تحديث الكاهن بنجاح');
      } else {
        await createPriest({ name, parish_ids: priestForm.parish_ids });
        showNotification(`تم إضافة الكاهن "${name}" بنجاح`);
      }
      cancelPriestForm();
      await loadData();
    } catch (err) {
      showNotification(err.message || 'فشل حفظ الكاهن', 'error');
    } finally {
      setIsSubmittingPriest(false);
    }
  };

  // ── Delete ──
  const executeDelete = async () => {
    setIsDeleting(true);
    try {
      if (deleteModal.type === 'parish') {
        await deleteParish(deleteModal.id);
        showNotification(`تم حذف رعية "${deleteModal.name}" بنجاح`);
      } else {
        await deletePriest(deleteModal.id);
        showNotification(`تم حذف الكاهن "${deleteModal.name}" بنجاح`);
      }
      setDeleteModal({ isOpen: false, type: null, id: null, name: '' });
      await loadData();
    } catch (err) {
      showNotification('فشل الحذف، قد يكون العنصر مرتبطاً ببيانات أخرى.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => !isDeleting && setDeleteModal({ isOpen: false, type: null, id: null, name: '' })}
        onConfirm={executeDelete}
        title="تأكيد الحذف النهائي"
        message={`هل أنت متأكد من حذف "${deleteModal.name}"؟ هذا الإجراء لا يمكن التراجع عنه.`}
        isProcessing={isDeleting}
      />

      {toast.show && (
        <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-xl shadow-xl z-50 flex items-center gap-3 text-white font-bold transition-all duration-300 ${toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}>
          <span>{toast.type === 'error' ? '⚠️' : '✅'}</span> {toast.message}
        </div>
      )}

      <div className="flex-1 p-4 lg:p-10 w-full overflow-y-auto">
        <div className="mb-8 border-b border-gray-200 pb-4">
          <h2 className="text-3xl font-bold text-purple-800">الإعدادات العامة</h2>
          <p className="text-gray-500 mt-2 font-bold">إدارة الرعايا والكهنة المستخدمة في التقارير الطبية.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-6 rounded-2xl text-red-600 font-bold text-center border border-red-100">⚠️ {error}</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ── الرعايا ── */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-indigo-500">
              <h3 className="font-bold text-lg text-indigo-900 mb-4 flex items-center gap-2">
                <span>⛪</span> الرعايا
                <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg">{parishes.length}</span>
              </h3>

              <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <input
                  type="text"
                  value={newParishName}
                  onChange={(e) => setNewParishName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddParish()}
                  placeholder="اسم الرعية الجديدة..."
                  className="flex-1 border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none"
                />
                <button
                  onClick={handleAddParish}
                  disabled={isSubmittingParish}
                  className={`bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md ${isSubmittingParish ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {isSubmittingParish ? '...' : 'إضافة'}
                </button>
              </div>

              {parishes.length === 0 ? (
                <p className="text-center text-gray-400 font-bold py-6">لا توجد رعايا بعد.</p>
              ) : (
                <ul className="space-y-2">
                  {parishes.map((parish) => (
                    <li key={parish.id} className="flex items-center justify-between gap-2 border border-gray-100 bg-gray-50/60 p-3 rounded-xl">
                      {editingParish?.id === parish.id ? (
                        <>
                          <input
                            type="text"
                            value={editParishName}
                            onChange={(e) => setEditParishName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleUpdateParish()}
                            className="flex-1 border border-indigo-300 p-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-400"
                          />
                          <button onClick={handleUpdateParish} className="text-emerald-600 font-bold text-sm bg-emerald-50 px-3 py-1.5 rounded-lg cursor-pointer">حفظ</button>
                          <button onClick={() => { setEditingParish(null); setEditParishName(''); }} className="text-gray-500 font-bold text-sm bg-gray-100 px-3 py-1.5 rounded-lg cursor-pointer">إلغاء</button>
                        </>
                      ) : (
                        <>
                          <span className="font-bold text-gray-700">{parish.name}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => { setEditingParish(parish); setEditParishName(parish.name); }}
                              className="text-indigo-500 hover:text-indigo-700 text-sm font-bold bg-indigo-50 px-3 py-1.5 rounded-lg cursor-pointer"
                            >
                              تعديل
                            </button>
                            <button
                              onClick={() => setDeleteModal({ isOpen: true, type: 'parish', id: parish.id, name: parish.name })}
                              className="text-red-500 hover:text-red-700 text-sm font-bold bg-red-50 px-3 py-1.5 rounded-lg cursor-pointer"
                            >
                              حذف
                            </button>
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* ── الكهنة ── */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-emerald-500">
              <h3 className="font-bold text-lg text-emerald-900 mb-4 flex items-center gap-2">
                <span>✝️</span> الكهنة
                <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg">{priests.length}</span>
              </h3>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-5 space-y-3">
                <input
                  type="text"
                  value={priestForm.name}
                  onChange={(e) => setPriestForm({ ...priestForm, name: e.target.value })}
                  placeholder="اسم الكاهن..."
                  className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none"
                />
                <div>
                  <p className="text-xs font-black text-gray-500 mb-2">الرعايا التابعة (اختر رعية واحدة على الأقل):</p>
                  {parishes.length === 0 ? (
                    <p className="text-xs text-amber-600 font-bold">أضف رعية أولاً قبل إضافة الكاهن.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                      {parishes.map((parish) => {
                        const selected = priestForm.parish_ids.includes(parish.id);
                        return (
                          <button
                            type="button"
                            key={parish.id}
                            onClick={() => togglePriestParish(parish.id)}
                            className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${selected ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-600 border-gray-300 hover:border-emerald-400'}`}
                          >
                            {selected ? '✓ ' : ''}{parish.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSubmitPriest}
                    disabled={isSubmittingPriest || parishes.length === 0}
                    className={`flex-1 font-bold py-2.5 px-4 rounded-xl transition-all shadow-md text-white ${editingPriestId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-700'} ${isSubmittingPriest || parishes.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {isSubmittingPriest ? 'جاري الحفظ...' : editingPriestId ? 'تحديث الكاهن' : 'إضافة الكاهن'}
                  </button>
                  {editingPriestId && (
                    <button onClick={cancelPriestForm} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2.5 px-4 rounded-xl cursor-pointer">إلغاء</button>
                  )}
                </div>
              </div>

              {priests.length === 0 ? (
                <p className="text-center text-gray-400 font-bold py-6">لا يوجد كهنة بعد.</p>
              ) : (
                <ul className="space-y-2">
                  {priests.map((priest) => (
                    <li key={priest.id} className="flex items-start justify-between gap-2 border border-gray-100 bg-gray-50/60 p-3 rounded-xl">
                      <div className="min-w-0">
                        <p className="font-bold text-gray-700">{priest.name}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(priest.parishes || []).map((p) => (
                            <span key={p.id} className="text-[10px] bg-white border border-gray-200 text-gray-500 font-bold px-2 py-0.5 rounded">{p.name}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => startEditPriest(priest)}
                          className="text-emerald-600 hover:text-emerald-800 text-sm font-bold bg-emerald-50 px-3 py-1.5 rounded-lg cursor-pointer"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, type: 'priest', id: priest.id, name: priest.name })}
                          className="text-red-500 hover:text-red-700 text-sm font-bold bg-red-50 px-3 py-1.5 rounded-lg cursor-pointer"
                        >
                          حذف
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
