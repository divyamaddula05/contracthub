import fetch from 'node-fetch';

const API = 'https://contracthub-api.onrender.com';

async function run(){
  // Login as admin
  const login = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@test.com', password: 'password123' })
  });
  const loginJson = await login.json();
  if (!loginJson.token) { console.error('Failed to login as admin', loginJson); process.exit(2); }
  const token = loginJson.token;

  // Get contracts
  const list = await fetch(`${API}/contracts`, { headers: { Authorization: `Bearer ${token}` } });
  const contracts = await list.json();
  console.log('Contracts count:', contracts.length);
  if (!contracts.length) return console.log('No contracts to delete');

  const id = contracts[0]._id;
  console.log('Deleting contract', id);
  const del = await fetch(`${API}/contracts/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
  const delJson = await del.json();
  console.log('Delete response:', del.status, delJson);
}

run().catch(e=>{ console.error(e); process.exit(1); });
