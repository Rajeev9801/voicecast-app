import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

async function testRecordingSave() {
  const email = "rajeevkumar9801456p@gmail.com";
  const password = "admin123"; 
  
  console.log("--- 🕵️ STEP 1: LOGIN TO GET TOKEN ---");
  const loginRes = await axios.post('http://127.0.0.1:5000/api/auth/login/admin', {
    email,
    password
  });
  const token = loginRes.data.token;
  console.log("TOKEN OBTAINED");

  console.log("--- 🕵️ STEP 2: SAVE RECORDING ---");
  const form = new FormData();
  form.append('title', 'Trace Recording Test');
  // Use any small file as mock audio
  const mockAudioPath = path.join(process.cwd(), 'package.json'); 
  form.append('audio', fs.createReadStream(mockAudioPath), {
    filename: 'test-audio.webm',
    contentType: 'audio/webm'
  });

  try {
    const res = await axios.post('http://127.0.0.1:5000/api/recordings/save', form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${token}`
      }
    });
    console.log("STATUS:", res.status);
    console.log("DATA:", res.data);
    console.log("✅ RECORDING SAVED SUCCESSFULLY");
  } catch (err) {
    console.log("ERROR STATUS:", err.response?.status);
    console.log("ERROR DATA:", err.response?.data);
  }
}

testRecordingSave();
