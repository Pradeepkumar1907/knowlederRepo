const testRegister = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'password123',
        role: 'customer'
      })
    });
    const data = await res.json();
    if (res.ok) {
      console.log('Register Success:', data);
    } else {
      console.error('Register Failed:', data);
    }
  } catch (err) {
    console.error('Register Error:', err.message);
  }
};

testRegister();
