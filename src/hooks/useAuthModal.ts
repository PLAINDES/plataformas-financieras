// src/hooks/useAuthModal.ts

import { useState } from 'react';

export type AuthModalType = 'login' | 'register' | null;

export function useAuthModal() {
  const [activeModal, setActiveModal] = useState<AuthModalType>(null);

  const openLogin = () => setActiveModal('login');
  const openRegister = () => setActiveModal('register');
  const closeModal = () => setActiveModal(null);

  const switchToRegister = () => setActiveModal('register');
  const switchToLogin = () => setActiveModal('login');

  return {
    activeModal,
    isLoginOpen: activeModal === 'login',
    isRegisterOpen: activeModal === 'register',
    openLogin,
    openRegister,
    closeModal,
    switchToRegister,
    switchToLogin,
  };
}