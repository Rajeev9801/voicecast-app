import axios from 'axios';

async function testVerify() {
  try {
    const res = await axios.post('http://127.0.0.1:5000/api/auth/verify-otp', {
      email: 'test@example.com',
      otp: '740810'
    });
    console.log('Verify Response:', res.data);
  } catch (err) {
    console.error('Verify Error:', err.response?.data || err.message);
  }
}

testVerify();
