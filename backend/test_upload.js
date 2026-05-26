import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

async function testUpload() {
  try {
    // 1. Login
    const loginRes = await axios.post('http://127.0.0.1:5000/api/auth/login/artist', {
      email: 'testartist@example.com',
      password: 'password123'
    });
    const token = loginRes.data.token;
    console.log('Login successful. Token length:', token.length);

    // Create a dummy audio file
    fs.writeFileSync('dummy.mp3', 'fake audio content');
    
    // 2. Upload Podcast
    const form = new FormData();
    form.append('title', 'My Test Podcast');
    form.append('description', 'Test Description');
    form.append('genre', 'Technology');
    form.append('audio', fs.createReadStream('dummy.mp3'));

    console.log('Sending upload request...');
    const uploadRes = await axios.post('http://127.0.0.1:5000/api/podcasts/upload', form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });

    console.log('Upload Response:', uploadRes.data);
  } catch (err) {
    console.error('Upload Error:', err.response?.data || err.message);
  } finally {
    if (fs.existsSync('dummy.mp3')) fs.unlinkSync('dummy.mp3');
  }
}

testUpload();