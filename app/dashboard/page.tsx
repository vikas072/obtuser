'use client'

import Link from 'next/link'
import { useAuth } from '@/src/AuthContext'
import { toast } from 'sonner'
import { PlayCircle, FileText, LogOut, Home, Lock } from 'lucide-react'
import { useRazorpay } from '@/src/hooks/useRazorpay'

const subjects = [
  { id: 1, name: 'Physics', year: '1st Year' },
  { id: 2, name: 'Engineering Mathematics', year: '1st Year' },
  { id: 3, name: 'Data Structures & Algorithms', year: '2nd Year' },
  { id: 4, name: 'Database Management Systems', year: '2nd Year' },
  { id: 5, name: 'Operating Systems', year: '3rd Year' },
  { id: 6, name: 'Computer Networks', year: '3rd Year' },
  { id: 7, name: 'Cloud Computing', year: '4th Year' },
  { id: 8, name: 'Machine Learning', year: '4th Year' },
]

export default function DashboardPage() {
  const { user, isPaid, loading, logout } = useAuth() as any
  const { startPayment, isLoading } = useRazorpay()

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

  const handleAccess = (type: string, subjectName: string) => {
    if (!isPaid) {
      toast.error(
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-base">Premium Content</span>
          <span className="text-sm">Please purchase the lifetime access to view {type} for {subjectName}.</span>
        </div>
      )
      return
    }
    toast.success(`Loading ${type} for ${subjectName}...`)
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
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">All Subjects</h2>
            {!isPaid && (
              <span className="text-sm font-medium text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full">
                Upgrade to unlock materials
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjects.map((subject, index) => {
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
                    <h3 className="font-semibold text-lg">{subject.name}</h3>
                    <p className="text-sm text-muted-foreground">{subject.year}</p>
                  </div>
                  <div className={`flex gap-2 shrink-0 ${!isUnlocked ? 'opacity-40 blur-[2px] pointer-events-none select-none' : ''}`}>
                    <button 
                      onClick={() => handleAccess('Videos', subject.name)}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors text-sm font-medium"
                    >
                      <PlayCircle className="w-4 h-4" />
                      Video
                    </button>
                    <button 
                      onClick={() => handleAccess('Notes', subject.name)}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-accent/10 text-accent hover:bg-accent hover:text-white transition-colors text-sm font-medium"
                    >
                      <FileText className="w-4 h-4" />
                      Notes
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        
      </div>
    </main>
  )
}
