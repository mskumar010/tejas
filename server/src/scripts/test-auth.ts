const API_URL = "http://localhost:3000/api/auth";

const testAuth = async () => {
  try {
    const email = `test${Date.now()}@example.com`;
    const password = "password123";

    // 1. Register
    console.log("Registering user...", email);
    const regRes = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const regData = await regRes.json();
    console.log("Register Response:", regRes.status, regData);

    if (!regRes.ok) throw new Error("Register failed");
    const token = regData.token;

    // 2. Login
    console.log("\nLogging in...");
    const loginRes = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const loginData = await loginRes.json();
    console.log("Login Response:", loginRes.status, loginData);

    // 3. Get Me
    console.log("\nGetting user profile...");
    const meRes = await fetch(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const meData = await meRes.json();
    console.log("Me Response:", meRes.status, meData);
  } catch (error) {
    console.error("Test Failed:", error);
  }
};

testAuth();
