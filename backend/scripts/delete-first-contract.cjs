(async () => {
  try {
    const API = '/api';

    // Login as admin
    const loginRes = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@test.com', password: 'password123' })
    });
    const loginJson = await loginRes.json();
    if (!loginJson.token) { console.error('Failed to login as admin', loginJson); process.exit(2); }
    const token = loginJson.token;

    // Get contracts
    const listRes = await fetch(`${API}/contracts`, { headers: { Authorization: `Bearer ${token}` } });
    const contracts = await listRes.json();
    console.log('Contracts count:', contracts.length);
    if (!contracts.length) return console.log('No contracts to delete');

    const id = contracts[0]._id;
    console.log('Deleting contract', id);
    const delRes = await fetch(`${API}/contracts/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    const delJson = await delRes.json();
    console.log('Delete response:', delRes.status, delJson);
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
})();
