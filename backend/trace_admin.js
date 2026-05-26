import axios from 'axios';

async function traceAdminLogin() {
  const email = "rajeevkumar9801456p@gmail.com";
  const password = "admin123"; 
  
  console.log("--- 🕵️ TRACING ADMIN LOGIN VIA AXIOS ---");
  try {
    const res = await axios.post('http://127.0.0.1:5000/api/auth/login/admin', {
      email,
      password
    });
    console.log("STATUS:", res.status);
    console.log("DATA:", res.data);
  } catch (err) {
    console.log("ERROR STATUS:", err.response?.status);
    console.log("ERROR DATA:", err.response?.data);
  }
}

traceAdminLogin();
