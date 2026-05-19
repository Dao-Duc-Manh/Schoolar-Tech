// backend/test-auth.js
const axios = require('axios');

async function testAuth() {
  try {
    // Test Health first
    const health = await axios.get('http://localhost:3000/api/health');
    console.log('✅ Health OK:', health.data.message);

    // Test Register
    console.log('\n🧪 Testing Register...');
    const registerRes = await axios.post('http://localhost:3000/api/auth/register', {
      fullName: 'Debug User',
      email: 'debug@test.com',
      password: '123456',
      role: 'teacher'
    });
    console.log('✅ Register success:', registerRes.data.message);

    // Test Login
    console.log('\n🧪 Testing Login...');
    const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'debug@test.com',
      password: '123456'
    });
    console.log('✅ Login success. Token:', loginRes.data.data.token ? 'OK' : 'NO TOKEN');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.status, error.response?.data || error.message);
  }
}

testAuth();
