'use client';

import { useRouter } from 'next/navigation';
import { LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import type { AdminUser } from '@/lib/admin/auth';

export function Header() {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    fetch('/api/v1/admin/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setUser(data.data);
      });
  }, []);

  const handleLogout = async () => {
    await fetch('/api/v1/admin/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  return (
    <header className="flex h-16 items-center justify-end border-b border-gray-200 bg-white px-6">
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="size-4" />
            <span>{user.name}</span>
            <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">
              {user.role}
            </span>
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-500">
          <LogOut className="size-4" />
          로그아웃
        </Button>
      </div>
    </header>
  );
}
