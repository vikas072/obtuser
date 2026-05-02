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
  const { user, isPaid, purchasedSemesters, loading, logout } = useAuth() as any
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
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        
        // Deduplicate and sort alphabetically by subject name
        const uniqueData = Array.from(new Map(data.map((item: any) => [`${item.subject}-${item.semester}`, item])).values()) as any[];
        uniqueData.sort((a: any, b: any) => a.subject.localeCompare(b.subject));
        setSubjects(uniqueData);
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

  const handleAccess = (type: 'video' | 'notes', subjectName: string, semester: number, url: string) => {
    const semId = `sem${semester}`;
    const hasAccess = purchasedSemesters?.includes(semId);

    if (!hasAccess) {
      toast.error(
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-base">Semester Locked</span>
          <span className="text-sm">Please unlock Semester {semester} to view {type} for {subjectName}.</span>
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
              <span className="text-muted-foreground">Active Semesters:</span>
              <span className="text-emerald-500 font-semibold">
                {(purchasedSemesters || []).length > 0 
                  ? purchasedSemesters.map((s: string) => s.replace('sem', 'Sem ')).join(', ') 
                  : 'None (Free Plan)'}
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
            
            {/* Progress Indicator */}
            <div className="flex items-center gap-3">
              <div className="h-2 w-24 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-500" 
                  style={{ width: `${((purchasedSemesters || []).length / 8) * 100}%` }}
                />
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                {(purchasedSemesters || []).length}/8 Semesters Unlocked
              </span>
            </div>
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

          {/* Top CTA for Locked Semesters */}
          {!isFetching && subjects.length > 0 && (() => {
            const displayedSems = Array.from(new Set(subjects.map(s => s.semester))).sort((a, b) => a - b);
            const lockedSems = displayedSems.filter(sem => !(purchasedSemesters || []).includes(`sem${sem}`));

            if (lockedSems.length === 0) return null;

            return (
              <div className="p-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-4 text-center md:text-left">
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                    <Lock className="w-6 h-6 text-amber-500" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg text-amber-500">Unlock All Materials</h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      Get full access to videos and notes for {lockedSems.map(s => `Semester ${s}`).join(' & ')}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  {lockedSems.map(sem => (
                    <button 
                      key={sem}
                      onClick={() => startPayment(`sem${sem}`)}
                      disabled={isLoading}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-60 scale-100 hover:scale-105 active:scale-95"
                    >
                      Unlock Sem {sem} ₹29
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}
          
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
              subjects.map((subject) => {
                // Ensure semester is treated as a number and semId is correctly formatted
                const semNumber = Number(subject.semester);
                const semId = semNumber ? `sem${semNumber}` : 'locked';
                const isUnlocked = semId !== 'locked' && (purchasedSemesters || []).includes(semId);

                return (
                  <div 
                    key={subject.id} 
                    className={`group relative p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-hidden
                      ${isUnlocked 
                        ? 'bg-card border-border hover:border-primary/30 hover:shadow-md' 
                        : 'bg-secondary/20 border-border/50'}`}
                  >
                    {/* Subject name — always visible and clear */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-lg truncate">{subject.subject}</h3>
                        {!isUnlocked && (
                          <div className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center gap-1.5 shrink-0">
                            <Lock className="w-3 h-3 text-amber-500" />
                            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Locked</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">Semester {subject.semester} • {subject.year}{subject.year === 1 ? 'st' : subject.year === 2 ? 'nd' : subject.year === 3 ? 'rd' : 'th'} Year</p>
                    </div>

                    {/* Buttons — visible but locked for non-paid */}
                    <div className="flex gap-2 shrink-0">
                      {isUnlocked ? (
                        <>
                          <button 
                            onClick={() => handleAccess('video', subject.subject, subject.semester, subject.videoURL)}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all text-sm font-medium"
                          >
                            <PlayCircle className="w-4 h-4" />
                            Video
                          </button>
                          <button 
                            onClick={() => handleAccess('notes', subject.subject, subject.semester, subject.notesURL)}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-accent/10 text-accent hover:bg-accent hover:text-white transition-all text-sm font-medium"
                          >
                            <FileText className="w-4 h-4" />
                            Notes
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => startPayment(semId)}
                          disabled={isLoading}
                          className="group/lock flex-1 sm:flex-none inline-flex items-center justify-center gap-3 px-6 py-2.5 rounded-xl bg-secondary/80 border border-border text-muted-foreground hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 shadow-sm"
                        >
                          <div className="relative">
                            <Lock className="w-4 h-4 text-amber-500 group-hover/lock:text-white transition-colors" />
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse group-hover/lock:hidden" />
                          </div>
                          <div className="flex flex-col items-start leading-tight">
                            <span className="text-sm font-bold">Locked</span>
                            <span className="text-[10px] opacity-70">Unlock for ₹29</span>
                          </div>
                        </button>
                      )}
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
