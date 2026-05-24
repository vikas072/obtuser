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

const subjectsByBranch = {
  'Mechanical Engineering': [
    'Technical Communication',
    'Human Value',
    'Math-IV',
    'Digital Electronics',
    'SOM',
    'Manufacturing Processes',
    'ATD',
    'TD',
    'Python',
    'Cyber Security',
    'FM',
    'ME',
  ],
  EEE: [
    'Technical Communication',
    'Human Value',
    'Python',
    'Cyber Security',
    'Maths-IV',
    'Digital Electronics',
    'NAS',
    'Digital Electronics Lab',
    'EM-I',
    'EMI',
    'EMFT',
    'BSS',
  ],
  ECE: [
    'Technical Communication',
    'Human Value',
    'Python',
    'Cyber Security',
    'Math-IV',
    'Digital Electronics',
    'Signal System',
    'Analog',
    'CE',
    'NAS',
    'DSD',
    'ED',
  ],
  'Civil Engineering': [
    'Technical Communication',
    'Python',
    'Human Value',
    'Math-IV',
    'Digital Electronics',
    'MTCP',
    'SOM',
    'HEM',
    'Surveying',
    'FM',
    'EM',
    'Cyber Security',
  ],
  'CSE & Allied': [
    'Data Structure',
    'Computer Organization & Architecture (COA)',
    'Python Programming',
    'DSTL',
    'Mathematics IV',
    'Technical Communication',
    'Human Values',
    'Cyber Security',
    'Digital Electronics',
    'Object Oriented Programming with Java (OOP with Java)',
    'TAFL (Theory of Automata & Formal Languages)',
    'Operating System',
  ],
}

async function update2ndYearSubjects() {
  console.log('Starting to update 2nd Year subjects...')
  
  // 1. Delete existing Year 2 subjects
  const contentRef = firestore.collection('content')
  const q = contentRef.where('year', '==', 2)
  const snapshot = await q.get()
  
  const deleteBatch = firestore.batch()
  let deleteCount = 0
  
  snapshot.forEach(doc => {
    deleteBatch.delete(doc.ref)
    deleteCount++
  })
  
  if (deleteCount > 0) {
    await deleteBatch.commit()
    console.log(`Successfully deleted ${deleteCount} existing 2nd Year subjects.`)
  } else {
    console.log('No existing 2nd Year subjects found to delete.')
  }

  // 2. Insert new branch-specific 2nd Year subjects
  const insertBatch = firestore.batch()
  let insertCount = 0

  for (const [branch, subjects] of Object.entries(subjectsByBranch)) {
    for (let i = 0; i < subjects.length; i++) {
      const subjectName = subjects[i]
      const semester = i < 6 ? 3 : 4
      
      const newDocRef = contentRef.doc()

      insertBatch.set(newDocRef, {
        year: 2,
        branch,
        subject: subjectName,
        semester,
        notesURL: `https://example.com/notes/${branch.toLowerCase()}/year2/${subjectName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`,
        videoURL: `https://example.com/video/${branch.toLowerCase()}/year2/${subjectName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      })
      insertCount++
    }
  }

  await insertBatch.commit()
  console.log(`Successfully inserted ${insertCount} new 2nd Year subjects!`)
}

update2ndYearSubjects().then(() => {
  process.exit(0)
}).catch(err => {
  console.error('Update failed:', err)
  process.exit(1)
})
