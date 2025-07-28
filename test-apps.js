const { chromium } = require('playwright');

async function testApps() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  
  console.log('🔍 Testing Client App (Port 3000)...');
  const clientPage = await context.newPage();
  await clientPage.goto('http://localhost:3000');
  await clientPage.waitForTimeout(2000);
  
  // Take screenshot
  await clientPage.screenshot({ path: '/home/a-pedraza/screenshots/client-test.png' });
  
  // Check for BrandHeader
  const clientHeader = await clientPage.locator('header').count();
  console.log(`Client header found: ${clientHeader > 0 ? '✅' : '❌'}`);
  
  if (clientHeader > 0) {
    const headerBg = await clientPage.locator('header').getAttribute('class');
    console.log(`Client header classes: ${headerBg}`);
  }
  
  console.log('🔍 Testing Admin App (Port 3001)...');
  const adminPage = await context.newPage();
  await adminPage.goto('http://localhost:3001');
  await adminPage.waitForTimeout(2000);
  
  // Take screenshot
  await adminPage.screenshot({ path: '/home/a-pedraza/screenshots/admin-test.png' });
  
  // Check for BrandHeader
  const adminHeader = await adminPage.locator('header').count();
  console.log(`Admin header found: ${adminHeader > 0 ? '✅' : '❌'}`);
  
  if (adminHeader > 0) {
    const headerBg = await adminPage.locator('header').getAttribute('class');
    console.log(`Admin header classes: ${headerBg}`);
  }
  
  // Check console errors
  console.log('🔍 Checking client console...');
  clientPage.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`❌ Client Error: ${msg.text()}`);
    }
  });
  
  adminPage.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`❌ Admin Error: ${msg.text()}`);
    }
  });
  
  await browser.close();
}

testApps().catch(console.error);