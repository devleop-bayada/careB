import { cn } from '@/lib/utils';
import { BookOpen, Briefcase, CheckSquare, CreditCard, FileText, Home, Search, Users } from 'lucide-react';
import Link from 'next/link';

type UserRole = 'guardian' | 'caregiver';

interface QuickAction {
  href: string;
  label: string;
  icon: React.ReactNode;
  bgColor: string;
  iconColor: string;
}

const guardianActions: QuickAction[] = [
  {
    href: '/search/caregiver',
    label: '요양보호사찾기',
    icon: <Search className="h-7 w-7" />,
    bgColor: 'bg-primary-50',
    iconColor: 'text-primary-500',
  },
  {
    href: '/care',
    label: '돌봄 관리',
    icon: <CheckSquare className="h-7 w-7" />,
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-500',
  },
  {
    href: '/voucher',
    label: '이용권 구매',
    icon: <CreditCard className="h-7 w-7" />,
    bgColor: 'bg-green-50',
    iconColor: 'text-green-500',
  },
  {
    href: '/community',
    label: '커뮤니티',
    icon: <Users className="h-7 w-7" />,
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-500',
  },
];

const caregiverActions: QuickAction[] = [
  {
    href: '/search/guardian',
    label: '일자리 찾기',
    icon: <Briefcase className="h-7 w-7" />,
    bgColor: 'bg-primary-50',
    iconColor: 'text-primary-500',
  },
  {
    href: '/care/journal',
    label: '돌봄 일지',
    icon: <FileText className="h-7 w-7" />,
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-500',
  },
  {
    href: '/my/certification',
    label: '인증 관리',
    icon: <CheckSquare className="h-7 w-7" />,
    bgColor: 'bg-green-50',
    iconColor: 'text-green-500',
  },
  {
    href: '/community',
    label: '커뮤니티',
    icon: <Users className="h-7 w-7" />,
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-500',
  },
];

interface QuickActionsProps {
  role?: UserRole;
  className?: string;
}

export default function QuickActions({ role = 'guardian', className }: QuickActionsProps) {
  const actions = role === 'caregiver' ? caregiverActions : guardianActions;

  return (
    <div className={cn('px-4 py-2', className)}>
      <div className="grid grid-cols-4 gap-3">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex flex-col items-center gap-2 group"
          >
            <div className={cn(
              'w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-150 group-active:scale-95',
              action.bgColor,
              action.iconColor,
            )}>
              {action.icon}
            </div>
            <span className="text-xs font-medium text-gray-700 text-center leading-tight">
              {action.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
