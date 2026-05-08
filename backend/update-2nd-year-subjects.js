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

// We apply to all branches so the user's dashboard isn't empty, 
// even though these are CS/AI specific.
const branches = ['CSE', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Allied']

// 12 new subjects for 2nd Year
const subjects2ndYear = [
  'Mathematics 3',
  'Mathematics 4',
  'Technical Communication',
  'Universal Human Value',
  'Data Structure',
  'Python',
  'OOP Java',
  'Digital Electronic',
  'COA (Computer Organization & Architecture)',
  'Operating System',
  'TAFL (Theory of Automata & Formal Languages)',
  'Cyber Security'
]

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

  // 2. Insert new 12 subjects for all branches
  const insertBatch = firestore.batch()
  let insertCount = 0

  for (const branch of branches) {
    for (let i = 0; i < subjects2ndYear.length; i++) {
      const subjectName = subjects2ndYear[i]
      
      // Let's divide them into Semester 3 and Semester 4 (6 subjects each)
      let semester = 3;
      if ([
        'Mathematics 4', 
        'Universal Human Value', 
        'Python', 
        'Operating System', 
        'TAFL (Theory of Automata & Formal Languages)', 
        'Cyber Security'
      ].includes(subjectName)) {
        semester = 4;
      }
      
      const newDocRef = contentRef.doc()

      insertBatch.set(newDocRef, {
        year: 2,
        branch,
        subject: `${subjectName} (${branch})`,
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
