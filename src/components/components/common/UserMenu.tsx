// src/components/common/UserMenu.tsx

import { useState, useRef, useEffect } from 'react';
import type { User } from '../../../types/user.types';

interface UserMenuProps {
  user: User;
  onLogout: () => void;
}

export function UserMenu({ user, onLogout }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const isAdmin = user.perfil === 1 || user.perfil === 2;
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  return (
    <div ref={menuRef} className="float-center" style={{ position: 'relative' }}>
      <div
        className="cursor-pointer symbol symbol-40px"
        onClick={() => setIsOpen(!isOpen)}
        title="Mi perfil"
      >
        <i className="fa-regular fa-circle-user" style={{ fontSize: '20px', color: '#000' }}></i>
      </div>
      
      {isOpen && (
        <div
          className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-800 menu-state-bg menu-state-color fw-semibold py-4 fs-6 w-275px"
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '0.5rem',
            backgroundColor: 'white',
            boxShadow: '0 0.5rem 1.5rem 0.5rem rgba(0, 0, 0, 0.075)',
            borderRadius: '0.625rem',
            zIndex: 1000,
          }}
        >
          {/* User Info */}
          <div className="menu-item px-3">
            <div className="menu-content d-flex align-items-center px-3">
              <div className="d-flex flex-column ps-3">
                <div className="fw-bold d-flex align-items-center fs-5">
                  {user.name} {user.lastname}
                  <span className="badge badge-light-success fw-bold fs-8 px-2 py-1 ms-2">
                    <i className="fa-solid fa-check text-success"></i>
                  </span>
                </div>
                <a href="#" className="fw-semibold text-muted text-hover-primary fs-7">
                  {user.email}
                </a>
              </div>
            </div>
          </div>
          
          {/* Admin Link */}
          {isAdmin && (
            <div className="menu-item px-5">
              <a
                href="/admin"
                target="_blank"
                rel="noopener noreferrer"
                className="menu-link px-5"
              >
                Administrador
              </a>
            </div>
          )}
          
          <div className="separator my-2"></div>
          
          {/* Logout */}
          <div className="menu-item px-5">
            <button
              onClick={onLogout}
              className="menu-link px-5"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
              }}
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}