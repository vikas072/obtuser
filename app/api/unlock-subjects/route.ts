import { NextResponse } from 'next/server'
import { firestore, firebaseAdmin, getFirebaseError } from '@/lib/firebase-admin'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { uid, semesterId, subjectIds } = body

    if (!uid || !semesterId || !Array.isArray(subjectIds) || subjectIds.length === 0) {
      return NextResponse.json({ error: 'uid, semesterId and subjectIds are required' }, { status: 400 })
    }

    if (!firestore) {
      return NextResponse.json({ error: getFirebaseError() || 'Firebase Admin is not configured.' }, { status: 500 })
    }

    await firestore.collection('users').doc(uid).set(
      {
        unlockedSubjects: firebaseAdmin.firestore.FieldValue.arrayUnion(...subjectIds),
        lastPaymentAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('unlock-subjects failed:', error)
    let detail = 'Unknown error'
    if (error instanceof Error) {
      detail = error.message
    } else if (typeof error === 'object') {
      detail = JSON.stringify(error)
    } else if (typeof error === 'string') {
      detail = error
    }
    return NextResponse.json({ error: `Unlock failed: ${detail}` }, { status: 500 })
  }
}
