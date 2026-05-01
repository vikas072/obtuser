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
  const { user } = useAuth() as any;

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

  useEffect(() => {
    fetchAllContent();
  }, [fetchAllContent]);

  // Filter results when query changes
  useEffect(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    const filtered = allContent
      .filter(item => item.subject?.toLowerCase().includes(trimmed))
      .slice(0, 8);
    setResults(filtered);
    setIsOpen(true);
  }, [query, allContent]);

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
              onFocus={() => query && setIsOpen(true)}
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
              {isSearching ? (
                <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
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
