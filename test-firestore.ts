import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function test() {
  try {
    const docRef = await addDoc(collection(db, 'rsvps'), {
      name: "Teste",
      status: "confirmado",
      createdAt: serverTimestamp()
    });
    console.log("Success! Doc ID:", docRef.id);
  } catch (e) {
    console.error("Error:", e);
  }
}

test();
