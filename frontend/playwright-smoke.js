import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  try {
    // Obtain client token via backend API and seed into localStorage before loading the app
    const loginResp = await (await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'client@test.com', password: 'password123' }),
    })).json();
    if (!loginResp.token) throw new Error('Failed to obtain client token');

    await page.addInitScript((token) => {
      localStorage.setItem('token', token);
    }, loginResp.token);

    await page.goto('http://localhost:5175/', { waitUntil: 'networkidle' });

    // Wait for the app to render and check for Download or Version entries
    await page.waitForTimeout(1200);

    const downloadLink = await page.$('a[href*="/uploads/"]');
    const viewBtn = await page.$('text=View');
    console.log('Download link present for CLIENT (expected true):', !!downloadLink);
    console.log('View button present for CLIENT (expected true):', !!viewBtn);

    // Now test admin: obtain admin token and reload app with admin session
    const adminLoginResp = await (await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@test.com', password: 'password123' }),
    })).json();
    if (!adminLoginResp.token) throw new Error('Failed to obtain admin token');

    // Open a fresh page for admin and seed the admin token before navigation
    const adminPage = await browser.newPage();
    await adminPage.addInitScript((token) => { localStorage.setItem('token', token); }, adminLoginResp.token);
    await adminPage.goto('http://localhost:5175/', { waitUntil: 'networkidle' });
    await adminPage.waitForTimeout(1200);

    const meResp = await adminPage.evaluate(async () => {
      const res = await fetch('http://localhost:5000/api/auth/me', { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } });
      try { return await res.json(); } catch (e) { return { error: e.toString() }; }
    });
    console.log('Auth me for admin page:', meResp);

    const contentAdmin = await adminPage.content();
    console.log('After admin load - page snippet:', contentAdmin.slice(0,1000));
    const downloadLinkAdmin = await adminPage.$('text=Download');
    console.log('Download link present for ADMIN (expected false):', !!downloadLinkAdmin);
    await adminPage.close();

    await browser.close();
    process.exitCode = 0;
  } catch (err) {
    console.error('Smoke test failed:', err);
    await browser.close();
    process.exitCode = 1;
  }
})();
