const admin = require('firebase-admin')
const path = require('path')
const dotenv = require('dotenv')

dotenv.config({ path: path.resolve(__dirname, '../backend/.env') })

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

const db = admin.firestore()

async function countSubjects() {
  const snapshot = await db.collection('content')
    .where('year', '==', 1)
    .where('branch', '==', 'CSE')
    .get()
  
  console.log(`Found ${snapshot.size} subjects for 1st Year CSE:`)
  snapshot.forEach(doc => {
    const data = doc.data()
    console.log(`- ${data.subject} (Sem ${data.semester})`)
  })
}

countSubjects()
