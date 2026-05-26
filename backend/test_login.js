import axios from 'axios';

async function testLogin() {
  try {
    const res = await axios.post('http://127.0.0.1:5000/api/auth/login/user', {
      email: 'test@example.com',
      password: 'WRONGPASSWORD'
    });
    console.log('Login Response:', res.data);
  } catch (err) {
    console.error('Login Error:', err.response?.data || err.message);
  }
}

testLogin();
