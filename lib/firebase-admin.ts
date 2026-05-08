import admin from 'firebase-admin';

let initError: string | null = null;

if (!admin.apps.length) {
  try {
    const projectId = (process.env.FIREBASE_PROJECT_ID || '').trim();
    const clientEmail = (process.env.FIREBASE_CLIENT_EMAIL || '').trim();
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n').trim();

    if (projectId && clientEmail && privateKey) {
      // Validate private key format roughly
      if (!privateKey.includes('BEGIN PRIVATE KEY')) {
        initError = 'FIREBASE_PRIVATE_KEY is missing the "BEGIN PRIVATE KEY" header.';
      } else {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
        console.log('Firebase Admin initialized successfully');
      }
    } else {
      const missing = [];
      if (!projectId) missing.push('FIREBASE_PROJECT_ID');
      if (!clientEmail) missing.push('FIREBASE_CLIENT_EMAIL');
      if (!privateKey) missing.push('FIREBASE_PRIVATE_KEY');
      initError = `Missing Firebase environment variables: ${missing.join(', ')}`;
    }
  } catch (error: any) {
    console.error('Firebase Admin initialization error:', error);
    initError = `Firebase Init Error: ${error.message || 'Unknown error'}`;
  }
}

export const firestore = admin.apps.length ? admin.firestore() : null;
export const getFirebaseError = () => initError;
export const firebaseAdmin = admin;
