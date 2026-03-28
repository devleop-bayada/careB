import { cn } from '@/lib/utils';
import { CheckCircle, Lock } from 'lucide-react';

interface Certification {
  key: string;
  label: string;
  completed: boolean;
}

const CERTIFICATIONS: Omit<Certification, 'completed'>[] = [
  { key: 'identity', label: '본인인증' },
  { key: 'resident', label: '등본/초본' },
  { key: 'caregiverLicense', label: '요양보호사 자격증' },
  { key: 'nursingAssistant', label: '간호조무사' },
  { key: 'socialWorker', label: '사회복지사' },
  { key: 'health', label: '건강확인' },
  { key: 'dementiaTraining', label: '치매전문교육' },
  { key: 'firstAid', label: '응급처치' },
  { key: 'criminal', label: '범죄경력' },
  { key: 'education', label: '교육이수' },
];

interface CertificationBadgesProps {
  completedKeys?: string[];
  className?: string;
}

export default function CertificationBadges({ completedKeys = [], className }: CertificationBadgesProps) {
  const certs: Certification[] = CERTIFICATIONS.map((c) => ({
    ...c,
    completed: completedKeys.includes(c.key),
  }));

  return (
    <div className={cn('px-4 py-4', className)}>
      <h3 className="text-sm font-semibold text-gray-900 mb-3">
        인증 현황 <span className="text-primary-500 font-bold">{completedKeys.length}</span>/{CERTIFICATIONS.length}
      </h3>
      <div className="grid grid-cols-5 gap-2">
        {certs.map((cert) => (
          <div
            key={cert.key}
            className={cn(
              'flex flex-col items-center gap-1 p-2 rounded-xl',
              cert.completed ? 'bg-primary-50' : 'bg-gray-50',
            )}
          >
            {cert.completed ? (
              <CheckCircle className="h-6 w-6 text-primary-500" />
            ) : (
              <Lock className="h-6 w-6 text-gray-300" />
            )}
            <span className={cn(
              'text-[10px] font-medium text-center leading-tight',
              cert.completed ? 'text-primary-700' : 'text-gray-400',
            )}>
              {cert.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
