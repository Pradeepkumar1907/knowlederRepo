const runTests = async () => {
    const timestamp = Date.now();
    const testUser = {
        name: 'Test User',
        email: `test_${timestamp}@example.com`,
        username: `user_${timestamp}`,
        password: 'password123',
        role: 'customer'
    };

    const API_URL = 'http://localhost:5000/api/auth';

    console.log('--- STARTING VERIFICATION TESTS ---');

    // Helper for requests
    const post = async (url, data) => {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await res.json();
        if (!res.ok) {
            throw { status: res.status, message: result.message };
        }
        return result;
    };

    // 1. Test Registration with Missing Username
    try {
        console.log('\n1. Testing Registration with Missing Username...');
        const { name, email, password, role } = testUser;
        await post(`${API_URL}/register`, { name, email, password, role });
        console.error('FAILED: Registration should have failed without username.');
    } catch (error) {
        console.log('PASSED:', error.message);
    }

    // 2. Test Registration with Full Data
    try {
        console.log('\n2. Testing Registration with Full Data...');
        await post(`${API_URL}/register`, testUser);
        console.log('PASSED: User registered successfully.');
    } catch (error) {
        console.error('FAILED:', error.message);
    }

    // 3. Test Login with Email
    try {
        console.log('\n3. Testing Login with Email...');
        await post(`${API_URL}/login`, {
            identifier: testUser.email,
            password: testUser.password
        });
        console.log('PASSED: Login with email successful.');
    } catch (error) {
        console.error('FAILED:', error.message);
    }

    // 4. Test Login with Username
    try {
        console.log('\n4. Testing Login with Username...');
        await post(`${API_URL}/login`, {
            identifier: testUser.username,
            password: testUser.password
        });
        console.log('PASSED: Login with username successful.');
    } catch (error) {
        console.error('FAILED:', error.message);
    }

    // 5. Test Login with Non-existent User
    try {
        console.log('\n5. Testing Login with Non-existent User...');
        await post(`${API_URL}/login`, {
            identifier: 'non_existent_user_12345',
            password: 'password123'
        });
        console.error('FAILED: Should have returned "User not found".');
    } catch (error) {
        if (error.message === 'User not found') {
            console.log('PASSED: Received "User not found".');
        } else {
            console.error('FAILED: Unexpected error:', error.message);
        }
    }

    // 6. Test Login with Wrong Password
    try {
        console.log('\n6. Testing Login with Wrong Password...');
        await post(`${API_URL}/login`, {
            identifier: testUser.username,
            password: 'wrong_password'
        });
        console.error('FAILED: Should have returned "Invalid credentials".');
    } catch (error) {
        if (error.message === 'Invalid credentials') {
            console.log('PASSED: Received "Invalid credentials".');
        } else {
            console.error('FAILED: Unexpected error:', error.message);
        }
    }

    console.log('\n--- VERIFICATION TESTS COMPLETE ---');
};

runTests();
