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

const branches = ['CSE & Allied', 'ECE', 'EEE', 'Mechanical', 'Civil', 'IT']

// 10 new subjects for 1st Year
const subjects1stYear = [
  'Mathematics 1',
  'Mathematics 2',
  'Engineering Physics',
  'Fundamental of Electrical Engineering',
  'Environmental Science',
  'Programming and Problem Solving (PPS)',
  'Fundamental of Electronics Engineering',
  'Engineering Chemistry',
  'Soft Skills',
  'Fundamental of Mechanical Engineering'
]

async function update1stYearSubjects() {
  console.log('Starting to update 1st Year subjects...')
  
  // 1. Delete existing Year 1 subjects
  const contentRef = firestore.collection('content')
  const q = contentRef.where('year', '==', 1)
  const snapshot = await q.get()
  
  const deleteBatch = firestore.batch()
  let deleteCount = 0
  
  snapshot.forEach(doc => {
    deleteBatch.delete(doc.ref)
    deleteCount++
  })
  
  if (deleteCount > 0) {
    await deleteBatch.commit()
    console.log(`Successfully deleted ${deleteCount} existing 1st Year subjects.`)
  } else {
    console.log('No existing 1st Year subjects found to delete.')
  }

  // 2. Insert new 10 subjects for all branches
  const insertBatch = firestore.batch()
  let insertCount = 0

  const customNotesURLs = {
    'Engineering Chemistry': 'https://drive.google.com/drive/folders/13SPbwkppOIMEdQowxMOl9RZtupf_xkg',
  }

  for (const branch of branches) {
    for (let i = 0; i < subjects1stYear.length; i++) {
      const subjectName = subjects1stYear[i]
      
      // Let's divide them into Semester 1 and Semester 2
      // e.g., first 5 in Sem 1, next 5 in Sem 2. Wait, 'Mathematics 2' is at index 1!
      // Better to manually assign semantics.
      let semester = 1;
      if (['Mathematics 2', 'Programming and Problem Solving (PPS)', 'Fundamental of Electronics Engineering', 'Engineering Chemistry', 'Fundamental of Mechanical Engineering'].includes(subjectName)) {
        semester = 2;
      }
      
      const notesURL = customNotesURLs[subjectName] || `https://example.com/notes/${branch.toLowerCase()}/year1/${subjectName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`
      const newDocRef = contentRef.doc()

      insertBatch.set(newDocRef, {
        year: 1,
        branch,
        subject: `${subjectName} (${branch})`,
        semester,
        notesURL,
        videoURL: `https://example.com/video/${branch.toLowerCase()}/year1/${subjectName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      })
      insertCount++
    }
  }

  await insertBatch.commit()
  console.log(`Successfully inserted ${insertCount} new 1st Year subjects!`)
}

update1stYearSubjects().then(() => {
  process.exit(0)
}).catch(err => {
  console.error('Update failed:', err)
  process.exit(1)
})
