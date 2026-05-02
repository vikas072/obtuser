const path = require('path')
const dotenv = require('dotenv')
const admin = require('firebase-admin')

// Load environment variables from backend/.env
dotenv.config({ path: path.resolve(__dirname, '.env') })

// Initialize Firebase Admin
if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (projectId && clientEmail && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    })
    console.log('Firebase Admin Initialized Successfully')
  } else {
    console.error(
      'Firebase Admin env vars are missing. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.'
    )
    process.exit(1)
  }
}

const firestore = admin.firestore()

async function deleteMaths2FromYear2() {
  console.log('Starting cleanup of Mathematics-II from Year 2...')
  
  const contentRef = firestore.collection('content')
  const q = contentRef.where('year', '==', 2)
  
  const snapshot = await q.get()
  
  if (snapshot.empty) {
    console.log('No subjects found for Year 2.')
    return
  }

  const batch = firestore.batch()
  let count = 0

  snapshot.forEach(doc => {
    const data = doc.data()
    if (data.subject && data.subject.includes('Mathematics-II')) {
      batch.delete(doc.ref)
      count++
    }
  })

  if (count > 0) {
    await batch.commit()
    console.log(`Successfully deleted ${count} instances of Mathematics-II from Year 2.`)
  } else {
    console.log('No Mathematics-II subjects found in Year 2.')
  }
}

deleteMaths2FromYear2().then(() => {
  process.exit(0)
}).catch(err => {
  console.error('Cleanup failed:', err)
  process.exit(1)
})
