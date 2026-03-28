"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import BackHeader from "@/components/layout/BackHeader";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import CustomDatePicker from "@/components/ui/CustomDatePicker";
import {
  useCareRecipients,
  useCreateRecipient,
  useUpdateRecipient,
  useDeleteRecipient,
} from "@/hooks/useCareRecipients";

interface CareRecipient {
  id: string;
  name: string;
  birthDate: string;
  gender: string;
  specialNotes?: string;
}

interface CareRecipientForm {
  name: string;
  birthDate: string;
  gender: string;
  specialNotes: string;
}

export default function CareRecipientsPage() {
  const { recipients, isLoading } = useCareRecipients();
  const createRecipient = useCreateRecipient();
  const updateRecipient = useUpdateRecipient();
  const deleteRecipient = useDeleteRecipient();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CareRecipientForm>({ name: "", birthDate: "", gender: "MALE", specialNotes: "" });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const saving = createRecipient.isPending || updateRecipient.isPending;

  function openAdd() {
    setEditingId(null);
    setForm({ name: "", birthDate: "", gender: "MALE", specialNotes: "" });
    setShowModal(true);
  }

  function openEdit(recipient: CareRecipient) {
    setEditingId(recipient.id);
    setForm({
      name: recipient.name,
      birthDate: recipient.birthDate.split("T")[0],
      gender: recipient.gender,
      specialNotes: recipient.specialNotes || "",
    });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.name || !form.birthDate) return;
    const body = { name: form.name, birthDate: form.birthDate, gender: form.gender, specialNotes: form.specialNotes };
    if (editingId) {
      await updateRecipient.mutateAsync({ id: editingId, ...body });
    } else {
      await createRecipient.mutateAsync(body);
    }
    setShowModal(false);
  }

  function requestDelete(id: string) {
    setDeleteTargetId(id);
    setConfirmOpen(true);
  }

  async function handleDelete() {
    if (!deleteTargetId) return;
    await deleteRecipient.mutateAsync(deleteTargetId);
    setDeleteTargetId(null);
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <BackHeader title="어르신 관리" fallbackHref="/my" />

      <div className="px-4 py-4">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : recipients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-gray-500 font-medium">등록된 어르신이 없어요</p>
            <button onClick={openAdd} className="mt-4 bg-primary-500 text-white text-sm font-semibold px-5 py-2.5 rounded-full">
              어르신 추가하기
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {recipients.map((recipient: CareRecipient) => {
              const parsedDate = recipient.birthDate ? new Date(recipient.birthDate) : null;
              const birthYear = parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate.getFullYear() : null;
              const age = birthYear !== null ? new Date().getFullYear() - birthYear : null;
              return (
                <div key={recipient.id} className="bg-white rounded-2xl border border-gray-100 px-4 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">👴</span>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{recipient.name}</p>
                      <p className="text-sm text-gray-600">{age !== null && birthYear !== null ? `${age}세 (${birthYear}년생)` : "생년 정보 없음"}</p>
                      {recipient.specialNotes && (
                        <p className="text-xs text-gray-400 mt-0.5">{recipient.specialNotes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(recipient)} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => requestDelete(recipient.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white rounded-t-3xl w-full max-w-[600px] px-5 py-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-gray-900">{editingId ? "어르신 정보 수정" : "어르신 추가"}</h2>
              <button onClick={() => setShowModal(false)}>
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">이름 *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="어르신 이름"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">생년월일 *</label>
                <CustomDatePicker
                  value={form.birthDate}
                  onChange={(val) => setForm({ ...form, birthDate: val })}
                  placeholder="생년월일 선택"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">성별</label>
                <div className="flex gap-3">
                  {[{ v: "MALE", label: "👴 남성" }, { v: "FEMALE", label: "👵 여성" }].map((g) => (
                    <button key={g.v} type="button" onClick={() => setForm({ ...form, gender: g.v })}
                      className={`flex-1 py-3 rounded-xl text-sm font-semibold border-2 transition-all ${
                        form.gender === g.v ? "border-primary-400 bg-primary-50 text-primary-600" : "border-gray-100 text-gray-600"
                      }`}>
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">특이사항 (선택)</label>
                <input type="text" value={form.specialNotes} onChange={(e) => setForm({ ...form, specialNotes: e.target.value })}
                  placeholder="질환, 거동 상태, 특이사항 등"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
              </div>
              <button onClick={handleSave} disabled={saving || !form.name || !form.birthDate}
                className="w-full bg-primary-500 text-white font-bold py-3.5 rounded-xl text-sm hover:bg-primary-600 transition-colors disabled:opacity-60 mt-2">
                {saving ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => { setConfirmOpen(false); setDeleteTargetId(null); }}
        onConfirm={handleDelete}
        title="어르신 삭제"
        message="어르신 정보를 삭제하시겠어요?"
        confirmText="삭제"
        cancelText="취소"
        variant="danger"
      />
    </div>
  );
}
