import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

async function testPodcastUpload() {
  const email = "rajeevkumar9801456p@gmail.com";
  const password = "admin123"; 
  
  console.log("--- 🕵️ STEP 1: LOGIN ---");
  const loginRes = await axios.post('http://127.0.0.1:5000/api/auth/login/admin', {
    email,
    password
  });
  const token = loginRes.data.token;

  console.log("--- 🕵️ STEP 2: UPLOAD PODCAST ---");
  const form = new FormData();
  form.append('title', 'Trace Podcast Test');
  form.append('category', 'Technology');
  
  const mockAudioPath = path.join(process.cwd(), 'package.json'); 
  form.append('audio', fs.createReadStream(mockAudioPath), {
    filename: 'test-audio.mp3',
    contentType: 'audio/mpeg'
  });

  try {
    const res = await axios.post('http://127.0.0.1:5000/api/podcasts/upload', form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${token}`
      }
    });
    console.log("STATUS:", res.status);
    console.log("DATA:", res.data);
  } catch (err) {
    console.log("ERROR STATUS:", err.response?.status);
    console.log("ERROR DATA:", err.response?.data);
  }
}

testPodcastUpload();
