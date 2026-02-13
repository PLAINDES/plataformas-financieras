// src/components/common/UserMenu.tsx

import { useState, useRef, useEffect } from 'react';
import type { User } from '../../../features/auth/types/user.types';
import { UserMenuBase } from '@/shared/components/common/UserMenu';
import { useAuth } from '../../auth/hooks/useAuth';

interface LandingUserMenuProps {
  user: User;
  onLogout: () => void;
}

export function LandingUserMenu({ user, onLogout }: LandingUserMenuProps) {

  const { isAdmin } = useAuth()
  
  return (
    <UserMenuBase user={user} onLogout={onLogout}>
           {/* Administrador Opciones */}
          {isAdmin && (
            <div className="px-2">
              <a
                href="/admin"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-3 py-2 text-sm font-semibold text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors group"
              >
                <svg className="w-4 h-4 mr-3 text-gray-400 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Panel Administrador
              </a>
            </div>
          )}
    </UserMenuBase>
  );
}

