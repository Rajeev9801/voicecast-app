import axios from 'axios';

async function testPlaylistCreate() {
  const email = "rajeevkumar9801456p@gmail.com";
  const password = "admin123"; 
  
  console.log("--- 🕵️ STEP 1: LOGIN ---");
  const loginRes = await axios.post('http://127.0.0.1:5000/api/auth/login/admin', {
    email,
    password
  });
  const token = loginRes.data.token;

  console.log("--- 🕵️ STEP 2: CREATE PLAYLIST ---");
  try {
    const res = await axios.post('http://127.0.0.1:5000/api/playlists', 
      { name: 'Trace Playlist' },
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    console.log("STATUS:", res.status);
    console.log("DATA:", res.data);
  } catch (err) {
    console.log("ERROR STATUS:", err.response?.status);
    console.log("ERROR DATA:", err.response?.data);
  }
}

testPlaylistCreate();
