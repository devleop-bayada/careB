'use client';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import { SERVICE_CATEGORIES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useUpload } from '@/hooks/useUpload';
import { Camera } from 'lucide-react';
import Image from 'next/image';
import { useRef, useState } from 'react';

type UserRole = 'guardian' | 'caregiver';

interface ProfileEditFormProps {
  role: UserRole;
  initialValues?: {
    name?: string;
    phone?: string;
    profileImage?: string | null;
    introduction?: string;
    address?: string;
    bio?: string;
    hourlyRate?: number;
    careTypes?: string[];
  };
  onSubmit?: (data: Record<string, unknown>) => void | Promise<void>;
  loading?: boolean;
}

export default function ProfileEditForm({ role, initialValues = {}, onSubmit, loading = false }: ProfileEditFormProps) {
  const [name, setName] = useState(initialValues.name ?? '');
  const [phone, setPhone] = useState(initialValues.phone ?? '');
  const [introduction, setIntroduction] = useState(initialValues.introduction ?? '');
  const [address, setAddress] = useState(initialValues.address ?? '');
  const [bio, setBio] = useState(initialValues.bio ?? '');
  const [hourlyRate, setHourlyRate] = useState(String(initialValues.hourlyRate ?? ''));
  const [selectedCareTypes, setSelectedCareTypes] = useState<string[]>(initialValues.careTypes ?? []);
  const [previewImage, setPreviewImage] = useState<string | null>(initialValues.profileImage ?? null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(initialValues.profileImage ?? null);
  const fileRef = useRef<HTMLInputElement>(null);
  const upload = useUpload();

  function toggleCareType(value: string) {
    setSelectedCareTypes((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit?.({
      name, phone, introduction, address, bio,
      profileImage: profileImageUrl,
      hourlyRate: hourlyRate ? Number(hourlyRate) : undefined,
      careTypes: selectedCareTypes,
    });
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    setPreviewImage(localUrl);
    try {
      const { url } = await upload.mutateAsync(file);
      setProfileImageUrl(url);
    } catch {
      setPreviewImage(profileImageUrl);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="px-4 py-4 space-y-5">
      {/* Profile image */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="relative w-20 h-20 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center"
        >
          {previewImage ? (
            <Image src={previewImage} alt="프로필" fill className="object-cover" />
          ) : (
            <Camera className="h-8 w-8 text-primary-400" />
          )}
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <Camera className="h-6 w-6 text-white" />
          </div>
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
      </div>

      {/* Common fields */}
      <Input label="이름" value={name} onChange={(e) => setName(e.target.value)} placeholder="이름을 입력해 주세요" />
      <Input label="연락처" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-0000-0000" type="tel" />

      {role === 'guardian' && (
        <>
          <Input label="주소" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="활동 지역을 입력해 주세요" />
          <Textarea
            label="한줄소개"
            value={introduction}
            onChange={(e) => setIntroduction(e.target.value)}
            placeholder="어르신 돌봄 관련 간단한 소개를 작성해 주세요"
            rows={3}
            maxLength={100}
            currentLength={introduction.length}
          />
        </>
      )}

      {role === 'caregiver' && (
        <>
          <Textarea
            label="자기소개"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="경력, 자격증, 요양 돌봄 스타일 등을 소개해 주세요"
            rows={5}
            maxLength={500}
            currentLength={bio.length}
          />
          <Input
            label="희망 시급 (원)"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            placeholder="예: 13000"
            type="number"
            min={0}
          />
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">서비스 분야</p>
            <div className="flex flex-wrap gap-2">
              {SERVICE_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => toggleCareType(cat.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-150',
                    selectedCareTypes.includes(cat.value)
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300',
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <Button type="submit" fullWidth loading={loading}>
        저장하기
      </Button>
    </form>
  );
}
