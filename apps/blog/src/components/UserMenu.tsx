import React, { useEffect, useState } from "react";

export default function UserMenu({ isMobile = false }: { isMobile?: boolean }) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Use a fallback for environments where import.meta.env might fail in specific bundlers, 
  // though Astro handles it natively.
  const apiUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.PUBLIC_API_URL) 
    ? import.meta.env.PUBLIC_API_URL 
    : 'http://localhost:3000';

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch(`${apiUrl}/api/auth/session`, {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          if (Object.keys(data).length > 0 && data.user) {
            setSession(data);
          }
        }
      } catch (e) {
        console.error("Failed to fetch session", e);
      } finally {
        setLoading(false);
      }
    }
    fetchSession();
  }, [apiUrl]);

  if (loading) {
    if (isMobile) {
      return <div className="h-11 rounded-xl bg-[var(--bg-tertiary)] animate-pulse w-full mt-2" />;
    }
    return <div className="h-9 w-9 rounded-full bg-[var(--bg-tertiary)] animate-pulse" />;
  }

  // --- Unauthenticated State ---
  if (!session?.user) {
    if (isMobile) {
      return (
        <div className="pt-2 mt-2 border-t border-[var(--border-primary)]">
          <a
            href={`${apiUrl}/login`}
            className="btn-primary flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold transition-all shadow-sm"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
               <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
               <polyline points="10 17 15 12 10 7" />
               <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            Login
          </a>
        </div>
      );
    }

    return (
      <a
        href={`${apiUrl}/login`}
        className="btn-primary inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
          <polyline points="10 17 15 12 10 7" />
          <line x1="15" y1="12" x2="3" y2="12" />
        </svg>
        <span>Login</span>
      </a>
    );
  }

  const handleLogout = async () => {
    try {
      const csrfRes = await fetch(`${apiUrl}/api/auth/csrf`, { credentials: 'include' });
      const { csrfToken } = await csrfRes.json();
      
      // Request JSON response to prevent Auth.js from issuing a 302 Redirect, 
      // which causes CORS errors in cross-origin fetch
      await fetch(`${apiUrl}/api/auth/signout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          csrfToken,
          redirectTo: window.location.href,
          redirect: false,
        }),
        credentials: 'include'
      });
    } catch (e) {
      console.error("Logout failed", e);
    } finally {
      setSession(null);
      window.location.reload();
    }
  };

  // --- Authenticated State ---
  if (isMobile) {
    return (
      <div className="pt-4 mt-2 border-t border-[var(--border-primary)] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 px-4">
            <img 
              src={session.user.image || `https://api.dicebear.com/9.x/notionists/svg?seed=${session.user.name}`} 
              alt={session.user.name} 
              className="h-10 w-10 rounded-full object-cover border border-[var(--border-primary)]" 
            />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-[var(--text-primary)]">{session.user.name}</span>
              <span className="text-xs text-[var(--text-secondary)] truncate w-40">{session.user.email}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col border-t border-[var(--border-primary)] pt-2 mt-1">
          <a 
            href={`${apiUrl}/admin/dashboard`}
            className="px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--color-brand-600)] transition-colors"
          >
            Writer Dashboard
          </a>
          <button 
            onClick={handleLogout}
            className="text-left px-4 py-2 text-sm font-semibold text-[var(--text-error)] hover:opacity-80 transition-colors"
          >
            Log Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 h-9 rounded-full hover:ring-2 hover:ring-[var(--border-focus)] transition-all overflow-hidden focus:outline-none">
        <img 
          src={session.user.image || `https://api.dicebear.com/9.x/notionists/svg?seed=${session.user.name}`} 
          alt={session.user.name} 
          className="h-9 w-9 rounded-full object-cover bg-[var(--bg-tertiary)]" 
        />
      </button>
      
      {/* Dropdown Menu */}
      <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-elevated)] p-1 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        <div className="px-3 py-2 border-b border-[var(--border-primary)] mb-1">
          <p className="text-sm font-medium text-[var(--text-primary)] truncate">{session.user.name}</p>
          <p className="text-xs text-[var(--text-secondary)] truncate">{session.user.email}</p>
        </div>
        <div className="flex flex-col">
          <a 
            href={`${apiUrl}/admin/dashboard`}
            className="block px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
          >
            Writer Dashboard
          </a>
          <button 
            onClick={handleLogout}
            className="text-left w-full px-3 py-1.5 text-sm font-medium text-[var(--text-error)] hover:bg-[var(--surface-error)] rounded-lg transition-colors mt-0.5"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
