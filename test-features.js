#!/usr/bin/env node

/**
 * Test script for validating:
 * 1. Data Isolation: Contracts only visible to assigned reviewer (CLIENT)
 * 2. Per-Version Status: Version approval status persists independently
 */

const axios = require('axios');

const API = axios.create({
  baseURL: 'https://contracthub-api.onrender.com',
  validateStatus: () => true // Don't throw on any status
});

let adminToken, client1Token, client2Token;
let contractId, versionId;

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(type, message) {
  const timestamp = new Date().toLocaleTimeString();
  if (type === 'pass') console.log(`${colors.green}✓${colors.reset} [${timestamp}] ${message}`);
  else if (type === 'fail') console.log(`${colors.red}✗${colors.reset} [${timestamp}] ${message}`);
  else if (type === 'info') console.log(`${colors.blue}ℹ${colors.reset} [${timestamp}] ${message}`);
  else if (type === 'section') console.log(`\n${colors.yellow}━━━ ${message} ━━━${colors.reset}\n`);
}

async function test() {
  try {
    log('section', 'SETUP: Login as Admin and Two Clients');
    
    // Login as admin
    let res = await API.post('/auth/login', { email: 'admin@test.com', password: 'password123' });
    if (res.status !== 200) throw new Error(`Admin login failed: ${res.status}`);
    adminToken = res.data.token;
    log('pass', `Admin logged in`);
    
    // Login as client1
    res = await API.post('/auth/login', { email: 'client1@test.com', password: 'password123' });
    if (res.status !== 200) throw new Error(`Client1 login failed: ${res.status}`);
    client1Token = res.data.token;
    log('pass', `Client1 logged in`);
    
    // Login as client2
    res = await API.post('/auth/login', { email: 'client2@test.com', password: 'password123' });
    if (res.status !== 200) throw new Error(`Client2 login failed: ${res.status}`);
    client2Token = res.data.token;
    log('pass', `Client2 logged in`);

    log('section', 'TEST 1: Data Isolation - Get Available Clients');
    
    // Get list of clients for reviewer assignment
    res = await API.get('/users?role=CLIENT', { headers: { 'Authorization': `Bearer ${adminToken}` } });
    if (res.status !== 200) throw new Error(`Get users failed: ${res.status}`);
    const clients = res.data;
    log('pass', `Retrieved ${clients.length} clients`);
    const client1Data = clients.find(c => c.email === 'client1@test.com');
    const client2Data = clients.find(c => c.email === 'client2@test.com');
    if (!client1Data || !client2Data) throw new Error('Test clients not found');
    log('pass', `Found client1 ID: ${client1Data._id.substring(0, 8)}... and client2 ID: ${client2Data._id.substring(0, 8)}...`);

    log('section', 'TEST 2: Data Isolation - Create Contract with Client1 as Reviewer');
    
    // Create contract assigned to client1
    res = await API.post('/contracts', 
      { title: 'Test Contract for Client1', reviewer: client1Data._id },
      { headers: { 'Authorization': `Bearer ${adminToken}` } }
    );
    if (res.status !== 201) throw new Error(`Create contract failed: ${res.status} - ${JSON.stringify(res.data)}`);
    contractId = res.data._id;
    log('pass', `Contract created with ID: ${contractId.substring(0, 8)}... assigned to client1`);

    log('section', 'TEST 3: Data Isolation - Verify Client1 Can See Their Contract');
    
    res = await API.get('/contracts', { headers: { 'Authorization': `Bearer ${client1Token}` } });
    if (res.status !== 200) throw new Error(`Get contracts failed: ${res.status}`);
    const client1Contracts = res.data.contracts;
    const contract1Found = client1Contracts.some(c => c._id === contractId);
    if (!contract1Found) throw new Error('Contract not found in client1 view');
    log('pass', `Client1 CAN see the contract (${client1Contracts.length} contract(s) visible)`);

    log('section', 'TEST 4: Data Isolation - Verify Client2 CANNOT See Client1\'s Contract');
    
    res = await API.get('/contracts', { headers: { 'Authorization': `Bearer ${client2Token}` } });
    if (res.status !== 200) throw new Error(`Get contracts failed: ${res.status}`);
    const client2Contracts = res.data.contracts;
    const contract2Found = client2Contracts.some(c => c._id === contractId);
    if (contract2Found) throw new Error('Data isolation broken: Client2 should not see Client1 contract');
    log('pass', `Client2 CANNOT see the contract (${client2Contracts.length} contract(s) visible)`);

    log('section', 'TEST 5: Per-Version Status - Upload Version as Admin');
    
    // Upload a version
    res = await API.post(`/contracts/${contractId}/versions`, 
      { fileName: 'test-v1.pdf', fileData: 'dummy data' },
      { headers: { 'Authorization': `Bearer ${adminToken}` } }
    );
    if (res.status !== 201) throw new Error(`Upload version failed: ${res.status}`);
    versionId = res.data._id;
    log('pass', `Version created with ID: ${versionId.substring(0, 8)}... with status: ${res.data.status}`);

    log('section', 'TEST 6: Per-Version Status - Verify Version is SUBMITTED');
    
    res = await API.get(`/contracts/${contractId}`, { headers: { 'Authorization': `Bearer ${client1Token}` } });
    if (res.status !== 200) throw new Error(`Get contract failed: ${res.status}`);
    const contract = res.data;
    const version = contract.versions[0];
    if (!version) throw new Error('Version not found');
    if (version.status !== 'SUBMITTED') throw new Error(`Expected status SUBMITTED, got ${version.status}`);
    log('pass', `Version status is SUBMITTED`);

    log('section', 'TEST 7: Per-Version Status - Client1 Approves Version');
    
    res = await API.put(`/contracts/${contractId}/versions/${versionId}/approve`,
      {},
      { headers: { 'Authorization': `Bearer ${client1Token}` } }
    );
    if (res.status !== 200) throw new Error(`Approve version failed: ${res.status}`);
    log('pass', `Approval successful - version status: ${res.data.status}`);

    log('section', 'TEST 8: Per-Version Status - Verify Version is Now APPROVED');
    
    res = await API.get(`/contracts/${contractId}`, { headers: { 'Authorization': `Bearer ${client1Token}` } });
    if (res.status !== 200) throw new Error(`Get contract failed: ${res.status}`);
    const updatedVersion = res.data.versions[0];
    if (updatedVersion.status !== 'APPROVED') throw new Error(`Expected status APPROVED, got ${updatedVersion.status}`);
    if (!updatedVersion.approvedBy) throw new Error('approvedBy field not set');
    log('pass', `Version status is now APPROVED - approvedBy: ${updatedVersion.approvedBy.substring(0, 8)}...`);

    log('section', 'TEST 9: Create Another Version and Test Rejection');
    
    res = await API.post(`/contracts/${contractId}/versions`, 
      { fileName: 'test-v2.pdf', fileData: 'dummy data v2' },
      { headers: { 'Authorization': `Bearer ${adminToken}` } }
    );
    if (res.status !== 201) throw new Error(`Upload version failed: ${res.status}`);
    const versionId2 = res.data._id;
    log('pass', `Version 2 created with ID: ${versionId2.substring(0, 8)}...`);

    log('section', 'TEST 10: Per-Version Status - Client1 Rejects Version 2');
    
    res = await API.put(`/contracts/${contractId}/versions/${versionId2}/reject`,
      { rejectionReason: 'Needs revision' },
      { headers: { 'Authorization': `Bearer ${client1Token}` } }
    );
    if (res.status !== 200) throw new Error(`Reject version failed: ${res.status}`);
    log('pass', `Rejection successful - version status: ${res.data.status}`);

    log('section', 'TEST 11: Per-Version Status - Verify Version 2 is REJECTED');
    
    res = await API.get(`/contracts/${contractId}`, { headers: { 'Authorization': `Bearer ${client1Token}` } });
    if (res.status !== 200) throw new Error(`Get contract failed: ${res.status}`);
    const rejectedVersion = res.data.versions.find(v => v._id === versionId2);
    if (rejectedVersion.status !== 'REJECTED') throw new Error(`Expected status REJECTED, got ${rejectedVersion.status}`);
    if (!rejectedVersion.rejectionReason) throw new Error('rejectionReason not set');
    log('pass', `Version 2 status is REJECTED with reason: "${rejectedVersion.rejectionReason}"`);

    log('section', '✅ ALL TESTS PASSED');
    console.log('\nSummary:');
    console.log(`  ✓ Data Isolation: Client2 cannot see contracts assigned to Client1`);
    console.log(`  ✓ Per-Version Status: Version statuses (SUBMITTED/APPROVED/REJECTED) are tracked independently`);
    console.log(`  ✓ Approval Metadata: approvedBy and rejectionReason are properly recorded`);
    
  } catch (error) {
    log('fail', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

test();
