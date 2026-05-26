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

async function listYear4() {
  try {
    const snapshot = await db.collection('content').where('year', '==', 4).get()
    console.log(`Total documents found in Year 4: ${snapshot.size}`)
    snapshot.forEach(doc => {
      const data = doc.data()
      console.log(`Doc ID: ${doc.id}, Subject: ${data.subject}, Branch: ${data.branch}, Semester: ${data.semester}`)
    })
  } catch (e) {
    console.error("Error listing Year 4 docs:", e)
  }
}

listYear4()
