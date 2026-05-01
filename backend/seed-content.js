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

const branches = ['CSE', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Allied']
const years = [1, 2, 3, 4]

// Sample subjects per year
const sampleSubjectsByYear = {
  1: ['Physics', 'Chemistry', 'Mathematics-I', 'Basic Electrical Engineering'],
  2: ['Data Structures', 'Digital Logic', 'Mathematics-II', 'Object Oriented Programming'],
  3: ['Operating Systems', 'Computer Networks', 'Database Management', 'Artificial Intelligence'],
  4: ['Cloud Computing', 'Machine Learning', 'Cyber Security', 'Major Project'],
}

async function seedContent() {
  console.log('Starting to seed content...')
  const batch = firestore.batch()
  const contentRef = firestore.collection('content')
  let count = 0

  for (const year of years) {
    for (const branch of branches) {
      // Get the standard subjects for this year, then append the branch name to make it look specialized
      const subjects = sampleSubjectsByYear[year]

      // For semester, we assume Year 1 = Sem 1 & 2, etc. We'll assign a mock semester.
      const semester = year * 2 - 1

      for (const subjectName of subjects) {
        // Create a unique document ID or let Firestore generate it
        const newDocRef = contentRef.doc()

        batch.set(newDocRef, {
          year,
          branch,
          subject: `${subjectName} (${branch})`,
          semester,
          notesURL: `https://example.com/notes/${branch.toLowerCase()}/year${year}/${subjectName.replace(/\s+/g, '-').toLowerCase()}`,
          videoURL: `https://example.com/video/${branch.toLowerCase()}/year${year}/${subjectName.replace(/\s+/g, '-').toLowerCase()}`,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        })
        count++
      }
    }
  }

  // Commit the batch
  try {
    await batch.commit()
    console.log(`Successfully seeded ${count} subjects into the "content" collection!`)
  } catch (error) {
    console.error('Error seeding content:', error)
  }
}

seedContent().then(() => {
  process.exit(0)
})
