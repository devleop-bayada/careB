'use client';

import { cn } from '@/lib/utils';
import { Briefcase, Home, MessageSquare, User, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type UserRole = 'guardian' | 'caregiver';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const guardianNav: NavItem[] = [
  { href: '/', label: '홈', icon: <Home className="h-6 w-6" /> },
  { href: '/search/caregiver', label: '요양보호사찾기', icon: <Users className="h-6 w-6" /> },
  { href: '/community', label: '커뮤니티', icon: <Users className="h-6 w-6" /> },
  { href: '/chat', label: '채팅', icon: <MessageSquare className="h-6 w-6" /> },
  { href: '/my', label: 'MY', icon: <User className="h-6 w-6" /> },
];

const caregiverNav: NavItem[] = [
  { href: '/', label: '홈', icon: <Home className="h-6 w-6" /> },
  { href: '/search/guardian', label: '일자리', icon: <Briefcase className="h-6 w-6" /> },
  { href: '/community', label: '커뮤니티', icon: <Users className="h-6 w-6" /> },
  { href: '/chat', label: '채팅', icon: <MessageSquare className="h-6 w-6" /> },
  { href: '/my', label: 'MY', icon: <User className="h-6 w-6" /> },
];

interface BottomNavProps {
  role?: UserRole;
}

export default function BottomNav({ role = 'guardian' }: BottomNavProps) {
  const pathname = usePathname();
  const navItems = role === 'caregiver' ? caregiverNav : guardianNav;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100">
      <div className="max-w-[600px] mx-auto flex items-center" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {navItems.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 transition-colors duration-150',
                isActive ? 'text-primary-500' : 'text-gray-400',
              )}
            >
              {item.icon}
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
