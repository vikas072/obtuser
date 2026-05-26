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

async function countIT() {
  const snapshot = await db.collection('content')
    .where('branch', '==', 'IT')
    .get()
  
  console.log(`Found ${snapshot.size} subjects for IT.`)
  snapshot.forEach(doc => {
    console.log(`- ${doc.data().subject} (Year ${doc.data().year}, Sem ${doc.data().semester})`)
  })
}

countIT()
