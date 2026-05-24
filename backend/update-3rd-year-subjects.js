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
  'CSE & Allied': [
    'Constitution of India',
    'Essence of Indian Traditional Knowledge',
    'DBMS',
    'Web Technology',
    'DAA',
    'Software Engineering',
    'Compiler Design',
    'Computer Networks',
  ],
  'Civil Engineering': [
    'Constitution of India',
    'Essence of Indian Traditional Knowledge',
    'Geotechnical Engineering',
    'Structural Analysis',
    'Quantity Estimation and Construction Management',
  ],
  EEE: [
    'Constitution of India',
    'Essence of Indian Traditional Knowledge',
    'Power System - I',
    'Control System',
    'Electrical Machines - II',
    'Power System - II',
    'Power Electronics',
    'Microprocessor',
  ],
  ECE: [
    'Constitution of India',
    'Essence of Indian Traditional Knowledge',
    'Integrated Circuits',
    'Microprocessor & Microcontroller',
    'Digital Signal Processing',
    'Digital Communication',
    'Control System',
    'Antenna and Wave Propagation',
  ],
  'Mechanical Engineering': [
    'Constitution of India',
    'Essence of Indian Traditional Knowledge',
    'Heat & Mass Transfer',
    'Machine Design',
    'Industrial Engineering',
    'Refrigeration and AC',
    'CAD',
    'CAM',
    'Theory of Machine',
  ],
}

async function update3rdYearSubjects() {
  console.log('Starting to update 3rd Year subjects...')

  // 1. Delete existing Year 3 subjects
  const contentRef = firestore.collection('content')
  const q = contentRef.where('year', '==', 3)
  const snapshot = await q.get()

  const deleteBatch = firestore.batch()
  let deleteCount = 0

  snapshot.forEach(doc => {
    deleteBatch.delete(doc.ref)
    deleteCount++
  })

  if (deleteCount > 0) {
    await deleteBatch.commit()
    console.log(`Successfully deleted ${deleteCount} existing 3rd Year subjects.`)
  } else {
    console.log('No existing 3rd Year subjects found to delete.')
  }

  // 2. Insert branch-specific 3rd Year subjects
  const insertBatch = firestore.batch()
  let insertCount = 0

  for (const [branch, subjects] of Object.entries(subjectsByBranch)) {
    for (let i = 0; i < subjects.length; i++) {
      const subjectName = subjects[i]
      const semester = i < Math.ceil(subjects.length / 2) ? 5 : 6
      const newDocRef = contentRef.doc()

      insertBatch.set(newDocRef, {
        year: 3,
        branch,
        subject: subjectName,
        semester,
        notesURL: `https://example.com/notes/${branch.toLowerCase()}/year3/${subjectName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`,
        videoURL: `https://example.com/video/${branch.toLowerCase()}/year3/${subjectName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      })
      insertCount++
    }
  }

  await insertBatch.commit()
  console.log(`Successfully inserted ${insertCount} new 3rd Year subjects!`)
}

update3rdYearSubjects().then(() => {
  process.exit(0)
}).catch(err => {
  console.error('Update failed:', err)
  process.exit(1)
})
