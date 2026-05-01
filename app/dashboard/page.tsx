'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useAuth } from '@/src/AuthContext'
import { toast } from 'sonner'
import { PlayCircle, FileText, LogOut, Home, Lock, Filter, BookOpen } from 'lucide-react'
import { useRazorpay } from '@/src/hooks/useRazorpay'
import { db } from '@/src/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useSearchParams } from 'next/navigation'

function DashboardContent() {
  const searchParams = useSearchParams()
  const { user, isPaid, loading, logout } = useAuth() as any
  const { startPayment, isLoading } = useRazorpay()

  const initialYear = Number(searchParams.get('year')) || 1
  const initialBranch = searchParams.get('branch') || 'CSE'

  const [selectedYear, setSelectedYear] = useState<number>(initialYear)
  const [selectedBranch, setSelectedBranch] = useState<string>(initialBranch)
  const [subjects, setSubjects] = useState<any[]>([])
  const [isFetching, setIsFetching] = useState(true)

  const [activeMedia, setActiveMedia] = useState<{ type: 'video' | 'notes' | null; url: string; title: string }>({ type: null, url: '', title: '' })

  const branches = ['CSE', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Allied']
  const years = [1, 2, 3, 4]

  useEffect(() => {
    if (!user) return;
    
    const fetchSubjects = async () => {
      setIsFetching(true);
      try {
        const q = query(
          collection(db as any, 'content'),
          where('year', '==', selectedYear),
          where('branch', '==', selectedBranch)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Sort alphabetically by subject name
        data.sort((a: any, b: any) => a.subject.localeCompare(b.subject));
        setSubjects(data);
      } catch (error) {
        console.error("Error fetching subjects:", error);
        toast.error("Failed to load subjects. Please try again later.");
      } finally {
        setIsFetching(false);
      }
    };

    fetchSubjects();
  }, [selectedYear, selectedBranch, user]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <p className="text-muted-foreground animate-pulse">Loading dashboard...</p>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl border border-border bg-card/50 backdrop-blur-xl p-8 text-center space-y-4 shadow-xl">
          <h1 className="text-3xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground text-lg">
            Please login with Google to access your dashboard and study materials.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 mt-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </main>
    )
  }

  const handleAccess = (type: 'video' | 'notes', subjectName: string, url: string) => {
    if (!isPaid) {
      toast.error(
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-base">Premium Content</span>
          <span className="text-sm">Please purchase the lifetime access to view {type} for {subjectName}.</span>
        </div>
      )
      return
    }
    
    if (!url) {
      toast.error(`No ${type} URL provided for this subject.`);
      return;
    }
    
    setActiveMedia({ type, url, title: subjectName });
  }

  return (
    <main className="min-h-screen bg-background text-foreground p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Profile & Status Header */}
        <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Welcome, {user.displayName || 'Student'}
            </h1>
            <p className="text-muted-foreground">{user.email}</p>
            <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-secondary/50 border border-border text-sm">
              <span className="text-muted-foreground">Status:</span>
              <span className={isPaid ? 'text-emerald-500 font-semibold' : 'text-amber-500 font-semibold'}>
                {isPaid ? 'Paid - Lifetime Access Active' : 'Free Plan (Action Required)'}
              </span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-border hover:bg-secondary transition-colors font-medium"
            >
              <Home className="w-4 h-4" />
              Home
            </Link>
            <button
              onClick={logout}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 border border-border transition-colors font-medium text-destructive"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Subjects List */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-2xl font-bold">Your Subjects</h2>
            {!isPaid && (
              <span className="text-sm font-medium text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full text-center">
                Upgrade to unlock materials
              </span>
            )}
          </div>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-card border border-border shadow-sm">
            <div className="flex-1 space-y-1">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Select Year
              </label>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}{y === 1 ? 'st' : y === 2 ? 'nd' : y === 3 ? 'rd' : 'th'} Year</option>
                ))}
              </select>
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Select Branch
              </label>
              <select 
                value={selectedBranch} 
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {branches.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isFetching ? (
              // Skeleton Loader
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-5 rounded-2xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse">
                   <div className="space-y-3 w-full">
                     <div className="h-6 bg-secondary rounded w-3/4"></div>
                     <div className="h-4 bg-secondary rounded w-1/4"></div>
                   </div>
                   <div className="flex gap-2 shrink-0 mt-4 sm:mt-0">
                     <div className="h-10 w-24 bg-secondary rounded-xl"></div>
                     <div className="h-10 w-24 bg-secondary rounded-xl"></div>
                   </div>
                </div>
              ))
            ) : subjects.length === 0 ? (
              <div className="col-span-full py-12 text-center border border-dashed border-border rounded-2xl bg-card/50">
                <p className="text-muted-foreground text-lg">No subjects found for this criteria.</p>
              </div>
            ) : (
              subjects.map((subject, index) => {
                const isUnlocked = isPaid || index === 0;

                return (
                  <div 
                    key={subject.id} 
                    className="relative p-5 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-hidden"
                  >
                    {!isUnlocked && (
                      <div className="absolute inset-0 z-10 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
                        <button 
                          onClick={startPayment}
                          disabled={isLoading}
                          className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white font-bold rounded-full shadow-lg hover:bg-accent/90 transition-transform hover:scale-105 disabled:opacity-60 disabled:scale-100"
                        >
                          <Lock className="w-4 h-4" />
                          {isLoading ? 'Processing...' : 'Unlock ₹29'}
                        </button>
                      </div>
                    )}

                    <div className={!isUnlocked ? 'opacity-40 blur-[2px] pointer-events-none select-none' : ''}>
                      <h3 className="font-semibold text-lg">{subject.subject}</h3>
                      <p className="text-sm text-muted-foreground">Sem {subject.semester} • {subject.year}{subject.year === 1 ? 'st' : subject.year === 2 ? 'nd' : subject.year === 3 ? 'rd' : 'th'} Year</p>
                    </div>
                    <div className={`flex gap-2 shrink-0 ${!isUnlocked ? 'opacity-40 blur-[2px] pointer-events-none select-none' : ''}`}>
                      <button 
                        onClick={() => handleAccess('video', subject.subject, subject.videoURL)}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors text-sm font-medium"
                      >
                        <PlayCircle className="w-4 h-4" />
                        Video
                      </button>
                      <button 
                        onClick={() => handleAccess('notes', subject.subject, subject.notesURL)}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-accent/10 text-accent hover:bg-accent hover:text-white transition-colors text-sm font-medium"
                      >
                        <FileText className="w-4 h-4" />
                        Notes
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
        
      </div>

      {/* Media Viewer Modal */}
      <Dialog open={!!activeMedia.type} onOpenChange={(open) => !open && setActiveMedia({ type: null, url: '', title: '' })}>
        <DialogContent className="max-w-5xl w-[95vw] h-[85vh] flex flex-col p-4 sm:p-6 bg-card border-border">
          <DialogHeader className="mb-2 shrink-0">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {activeMedia.title}
            </DialogTitle>
            <DialogDescription>
              {activeMedia.type === 'video' ? 'Watching Video Lecture' : 'Reading Study Notes'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 rounded-xl overflow-hidden border border-border bg-black/5 relative w-full h-full">
            {activeMedia.url ? (
              <iframe 
                src={activeMedia.url} 
                className="absolute inset-0 w-full h-full border-0 rounded-xl" 
                allow="autoplay; fullscreen; encrypted-media" 
                title={activeMedia.title}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                No preview available
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </main>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <p className="text-muted-foreground animate-pulse">Loading dashboard...</p>
      </main>
    }>
      <DashboardContent />
    </Suspense>
  )
}
