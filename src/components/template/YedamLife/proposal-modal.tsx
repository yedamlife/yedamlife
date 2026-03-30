'use client';

import { useState, useEffect } from 'react';
import { Download, FileText, X } from 'lucide-react';
import { BRAND_COLOR } from './constants';

const PROPOSAL_ZIP_URL =
  'https://mrwwnkmklzgevbzdkbtz.supabase.co/storage/v1/object/public/private-templates/yedam/yedam_company_proposal.zip';

interface ProposalModalProps {
  open: boolean;
  onClose: () => void;
}

const FIELDS = [
  { key: 'name', label: '이름', msg: '이름을 입력해주세요.' },
  { key: 'phone', label: '연락처', msg: '연락처를 입력해주세요.' },
  { key: 'email', label: '이메일', msg: '이메일을 입력해주세요.' },
  { key: 'companyName', label: '회사명', msg: '회사명을 입력해주세요.' },
  { key: 'position', label: '직급', msg: '직급을 입력해주세요.' },
] as const;

type FormKey = (typeof FIELDS)[number]['key'];

export function ProposalModal({ open, onClose }: ProposalModalProps) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    companyName: '',
    position: '',
  });
  const [touched, setTouched] = useState<Record<FormKey, boolean>>({
    name: false,
    phone: false,
    email: false,
    companyName: false,
    position: false,
  });

  useEffect(() => {
    if (open) {
      setTouched({ name: false, phone: false, email: false, companyName: false, position: false });
    }
  }, [open]);

  const getError = (key: FormKey) => {
    if (!touched[key]) return '';
    const field = FIELDS.find((f) => f.key === key)!;
    return form[key].trim() ? '' : field.msg;
  };

  const handleSubmit = () => {
    const allTouched = Object.fromEntries(FIELDS.map((f) => [f.key, true])) as Record<FormKey, boolean>;
    setTouched(allTouched);
    if (FIELDS.some((f) => !form[f.key].trim())) return;
    window.open(PROPOSAL_ZIP_URL, '_blank');
    onClose();
  };

  if (!open) return null;

  const inputClass = (key: FormKey) =>
    `w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all bg-gray-50 focus:bg-white ${
      getError(key)
        ? 'border-red-400 focus:ring-red-300/40'
        : 'border-gray-200 focus:ring-[#4a5a2b]/30'
    }`;

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 flex items-center justify-between bg-gray-100">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-700" />
            <span className="font-semibold text-sm text-gray-700">
              기업상조 제안서 확인
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-black/5 rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-500 mb-2">
            아래 정보를 입력하시면 제안서를 다운로드하실 수 있습니다.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#4a5a2b] mb-1.5">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="이름"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
                className={inputClass('name')}
              />
              {getError('name') && <p className="text-xs text-red-500 mt-1">{getError('name')}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#4a5a2b] mb-1.5">
                연락처 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="'-' 빼고 숫자만"
                value={form.phone}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, phone: e.target.value }))
                }
                onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
                className={inputClass('phone')}
              />
              {getError('phone') && <p className="text-xs text-red-500 mt-1">{getError('phone')}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#4a5a2b] mb-1.5">
              이메일 <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              placeholder="example@company.com"
              value={form.email}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, email: e.target.value }))
              }
              onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
              className={inputClass('email')}
            />
            {getError('email') && <p className="text-xs text-red-500 mt-1">{getError('email')}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#4a5a2b] mb-1.5">
                회사명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="회사명"
                value={form.companyName}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    companyName: e.target.value,
                  }))
                }
                onBlur={() => setTouched((prev) => ({ ...prev, companyName: true }))}
                className={inputClass('companyName')}
              />
              {getError('companyName') && <p className="text-xs text-red-500 mt-1">{getError('companyName')}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#4a5a2b] mb-1.5">
                직급 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="직급"
                value={form.position}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    position: e.target.value,
                  }))
                }
                onBlur={() => setTouched((prev) => ({ ...prev, position: true }))}
                className={inputClass('position')}
              />
              {getError('position') && <p className="text-xs text-red-500 mt-1">{getError('position')}</p>}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all hover:opacity-80 cursor-pointer mt-2"
            style={{
              backgroundColor: BRAND_COLOR,
              color: '#ffffff',
            }}
          >
            <Download className="w-4 h-4" />
            제안서 다운로드
          </button>
        </div>
      </div>
    </div>
  );
}
