import axios from 'axios';

async function testRegister() {
  try {
    const res = await axios.post('http://127.0.0.1:5000/api/auth/register', {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'listener'
    });
    console.log('Register Response:', res.data);
  } catch (err) {
    console.error('Register Error:', err.response?.data || err.message);
  }
}

testRegister();
