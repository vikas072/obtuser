'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, X, BookOpen, Video, ChevronRight } from 'lucide-react';
import { db } from '@/src/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useAuth } from '@/src/AuthContext';

interface SubjectDoc {
  id: string;
  subject: string;
  branch: string;
  year: number;
  semester: number;
  notesURL?: string;
  videoURL?: string;
}

let cachedContent: SubjectDoc[] | null = null;

export function Navbar() {
  const router = useRouter();
  const { user, login } = useAuth() as any;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SubjectDoc[]>([]);
  const [allContent, setAllContent] = useState<SubjectDoc[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Pre-fetch all content once and cache it
  const fetchAllContent = useCallback(async () => {
    if (cachedContent) {
      setAllContent(cachedContent);
      return;
    }
    setIsSearching(true);
    try {
      const snapshot = await getDocs(collection(db as any, 'content'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SubjectDoc[];
      cachedContent = data;
      setAllContent(data);
    } catch (err) {
      console.error('Error fetching content for search:', err);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleGoogleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Google login failed:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAllContent();
    }
  }, [user, fetchAllContent]);

  // Filter results when query changes
  useEffect(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      setResults([]);
      if (user) {
        setIsOpen(false);
      }
      return;
    }
    const filtered = allContent
      .filter(item => item.subject?.toLowerCase().includes(trimmed))
      .slice(0, 8);
    setResults(filtered);
    setIsOpen(true);
  }, [query, allContent, user]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleResultClick = (item: SubjectDoc) => {
    setQuery('');
    setIsOpen(false);
    // Navigate to dashboard with year and branch as query params
    router.push(`/dashboard?year=${item.year}&branch=${encodeURIComponent(item.branch)}`);
  };

  const clearSearch = () => {
    setQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-sm">
            <span className="text-sm font-bold text-white">O</span>
          </div>
          <span className="text-lg font-bold text-foreground hidden sm:block">Optusers</span>
        </Link>

        {/* Search Bar */}
        <div ref={containerRef} className="relative flex-1 max-w-xl">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-200 bg-secondary/40 ${isOpen ? 'border-primary/50 ring-2 ring-primary/10 bg-background' : 'border-border hover:border-primary/30'}`}>
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                if (user) {
                  fetchAllContent();
                }
                if (query || !user) {
                  setIsOpen(true);
                }
              }}
              placeholder="Search subjects, notes, videos..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none min-w-0"
            />
            {query && (
              <button onClick={clearSearch} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
 
          {/* Dropdown Results */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-2xl shadow-black/20 overflow-hidden z-50">
              {!user ? (
                <div className="p-5 text-center space-y-3">
                  <p className="text-sm text-muted-foreground font-medium">
                    Please login to search all B.Tech notes and lectures.
                  </p>
                  <button
                    onClick={handleGoogleLogin}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-xs font-bold hover:opacity-90 transition-opacity shadow-md"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Login with Google
                  </button>
                </div>
              ) : isSearching ? (
                <div className="p-4 text-center text-sm text-muted-foreground animate-pulse">Loading subjects...</div>
              ) : results.length > 0 ? (
                <ul>
                  {results.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => handleResultClick(item)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/60 transition-colors text-left group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <BookOpen className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{item.subject}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.branch} · Year {item.year} · Sem {item.semester}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.videoURL && <Video className="w-3.5 h-3.5 text-primary" />}
                          {item.notesURL && <BookOpen className="w-3.5 h-3.5 text-accent" />}
                          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground ml-1" />
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No subjects found for "<span className="font-medium text-foreground">{query}</span>"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right side nav */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/#pricing"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
            >
              Get Access ₹29
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
