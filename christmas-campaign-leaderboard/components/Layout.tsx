import React from 'react';
import { Recruiter } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: Recruiter | null;
  isAdmin: boolean;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, isAdmin, onLogout }) => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <nav className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
              <span className="font-bold text-xl tracking-tight">Christmas <span className="text-red-500">Campaign</span></span>
            </div>
            {(user || isAdmin) && (
              <div className="flex items-center gap-4">
                {isAdmin && (
                    <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                        Admin Mode
                    </span>
                )}
                <div className="flex items-center gap-2">
                   {user && (
                    <>
                        <img src={user.avatar} alt="User" className="w-8 h-8 rounded-full border border-slate-600" />
                        <span className="text-sm font-medium hidden sm:block">{user.name}</span>
                    </>
                   )}
                </div>
                <button 
                  onClick={onLogout}
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
      <main className="flex-grow">
        {children}
      </main>
      <footer className="border-t border-slate-800 py-6 text-center text-slate-500 text-sm">
        <p>© 2025 Christmas Campaign. Happy Hunting!</p>
      </footer>
    </div>
  );
};