const API_URL = 'http://127.0.0.1:5000/api';

const runDebug = async () => {
  try {
    // 1. Login
    console.log('Logging in...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'testuser123', // From previous register test
        password: 'password123'
      })
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) throw new Error(loginData.message);
    const token = loginData.token;
    console.log('Logged in.');

    // 2. Call /api/articles/my
    console.log('Calling /api/articles/my...');
    const res = await fetch(`${API_URL}/articles/my`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) {
      console.error('Status:', res.status);
      console.error('Data:', JSON.stringify(data, null, 2));
      throw new Error(`API returned ${res.status}`);
    }
    console.log('Success:', data.length, 'articles found.');
  } catch (error) {
    console.error('DEBUG FAILED:', error.message);
  }
};

runDebug();
