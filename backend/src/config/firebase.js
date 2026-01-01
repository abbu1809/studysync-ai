const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
let serviceAccount;

// For production (Render): use environment variable JSON
if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  try {
    serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
    console.log('✅ Using service account from environment variable');
  } catch (error) {
    console.error('❌ Error parsing GOOGLE_APPLICATION_CREDENTIALS_JSON:', error.message);
    throw error;
  }
}
// For development: use local file
else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  try {
    const serviceAccountPath = path.resolve(__dirname, '../..', process.env.GOOGLE_APPLICATION_CREDENTIALS);
    serviceAccount = require(serviceAccountPath);
    console.log('✅ Using service account from file');
  } catch (error) {
    console.error('❌ Error loading service account file:', error.message);
    throw error;
  }
}
// Fallback
else {
  console.error('❌ No Firebase credentials found!');
  throw new Error('Missing Firebase credentials. Set GOOGLE_APPLICATION_CREDENTIALS_JSON or GOOGLE_APPLICATION_CREDENTIALS');
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
  });
}

const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();

// Firestore settings for better performance
db.settings({
  ignoreUndefinedProperties: true,
  timestampsInSnapshots: true
});

module.exports = {
  admin,
  db,
  auth,
  storage
};
