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

async function listBranches() {
  try {
    const snapshot = await db.collection('content').limit(20).get()
    console.log(`Total documents found in content (limit 20): ${snapshot.size}`)
    const branches = new Set()
    snapshot.forEach(doc => {
      const data = doc.data()
      branches.add(data.branch)
      console.log(`Doc ID: ${doc.id}, Subject: ${data.subject}, Year: ${data.year}, Branch: ${data.branch}, Semester: ${data.semester}`)
    })
    console.log("All unique branches in these 20 docs:", Array.from(branches))
  } catch (e) {
    console.error("Error listing content docs:", e)
  }
}

listBranches()
