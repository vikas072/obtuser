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

// Sample subjects per year - expanded to ensure selection rules (5 or 6 subjects) work
const sampleSubjectsByYear = {
  1: ['Physics', 'Chemistry', 'Mathematics-I', 'Mathematics-II', 'Basic Electrical Engineering', 'Environmental Science', 'Engineering Graphics', 'Communication Skills'],
  2: ['Data Structures', 'Digital Logic', 'Mathematics-III', 'Mathematics-IV', 'Object Oriented Programming', 'Human Value', 'Technical Communication', 'Python Programming', 'Computer Architecture', 'Discrete Structures'],
  3: ['Operating Systems', 'Computer Networks', 'Database Management', 'Artificial Intelligence', 'Software Engineering', 'Compiler Design', 'Web Development', 'Mobile Computing'],
  4: ['Cloud Computing', 'Machine Learning', 'Cyber Security', 'Major Project', 'Data Science', 'Internet of Things'],
}

async function seedContent() {
  console.log('Starting to seed content...')
  const batch = firestore.batch()
  const contentRef = firestore.collection('content')
  let count = 0

  for (const year of years) {
    for (const branch of branches) {
      const yearSubjects = sampleSubjectsByYear[year]

      for (let i = 0; i < yearSubjects.length; i++) {
        const subjectName = yearSubjects[i]
        // Assign roughly half to first sem of the year, half to second sem
        const semester = i % 2 === 0 ? (year * 2 - 1) : (year * 2)
        
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
