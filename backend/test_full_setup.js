import axios from 'axios';

async function testFullSetup() {
  const email = "rajeevkumar9801456p@gmail.com";
  const password = "newadminpassword123";
  
  console.log("--- 1. REQUESTING ADMIN OTP ---");
  const res1 = await axios.post('http://127.0.0.1:5000/api/auth/admin/request-otp', { email });
  console.log("REQ-OTP:", res1.data.message);

  // We need the OTP from the DB since we can't read the email
  console.log("--- 2. PLEASE MANUALLY CHECK DB OR LOGS FOR OTP ---");
  // Assuming I find it in logs or use a script to get it
}

// I'll create a script to just FORCE set the password for that specific email
