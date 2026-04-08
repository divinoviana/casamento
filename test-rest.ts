import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const projectId = config.projectId;
const databaseId = config.firestoreDatabaseId;

async function testRest() {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/rsvps`;
  
  const body = {
    fields: {
      name: { stringValue: "Teste REST" },
      status: { stringValue: "confirmado" }
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    console.log("Status:", response.status);
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Error:", e);
  }
}

testRest();
