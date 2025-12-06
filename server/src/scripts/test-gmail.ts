const API_URL = "http://localhost:3000/api";

const testGmail = async () => {
  try {
    // 1. Login to get token
    console.log("Logging in...");
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
      }),
    });

    if (!loginRes.ok) {
      // If login fails, try registering first (quick hacks)
      const regRes = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: `test${Date.now()}@example.com`,
          password: "password123",
        }),
      });
      const regData = await regRes.json();
      var token = regData.token;
    } else {
      const data = await loginRes.json();
      token = data.token;
    }

    // 2. Get Google Auth URL
    console.log("\nRequesting Gmail Connect URL...");
    const connectRes = await fetch(`${API_URL}/gmail/connect`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const connectData = await connectRes.json();
    console.log("Connect Response:", connectRes.status, connectData);

    if (connectData.url && connectData.url.includes("accounts.google.com")) {
      console.log("SUCCESS: Got valid Google Auth URL");
    } else {
      console.log("FAILURE: Invalid user or response");
    }
  } catch (error) {
    console.error("Test Failed:", error);
  }
};

testGmail();
