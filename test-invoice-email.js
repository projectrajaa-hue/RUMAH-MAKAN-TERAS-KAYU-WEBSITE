#!/usr/bin/env node

require('dotenv').config();
const { sendInvoice } = require('./services/emailService');

async function testInvoiceEmail() {
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║           Test Invoice Email Function                       ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  console.log('');

  try {
    // Create a test order
    console.log('[1] Creating test order...');
    const testOrder = {
      id: 999,
      customerName: 'Test Customer',
      customerEmail: 'kciptaraksa@gmail.com',
      customerPhone: '081234567890',
      customerAddress: 'Jl. Test No. 123',
      status: 'confirmed',
      total: 150000,
      items: {
        '1': 2,
        '2': 1
      },
      notes: 'Test order untuk testing email',
      createdAt: new Date()
    };
    console.log('✅ Test order created\n');

    // Test menu names
    console.log('[2] Setting up menu names...');
    const menuNames = {
      '1': 'Nasi Goreng',
      '2': 'Mie Goreng'
    };
    console.log('✅ Menu names set\n');

    // Test sendInvoice function
    console.log('[3] Testing sendInvoice function...');
    console.log(`    Sending email to: ${testOrder.customerEmail}`);
    console.log(`    Order ID: ${testOrder.id}`);
    console.log(`    Order Status: ${testOrder.status}`);
    console.log('');

    const result = await sendInvoice(testOrder, Object.values(menuNames).map((name, idx) => ({
      id: idx + 1,
      name: name
    })));

    console.log('');
    if (result) {
      console.log('╔═══════════════════════════════════════════════════════════════╗');
      console.log('║          ✅ EMAIL SENT SUCCESSFULLY!                          ║');
      console.log('╚═══════════════════════════════════════════════════════════════╝');
      console.log('');
      console.log('Check your email inbox or spam folder');
      console.log('');
    } else {
      console.log('╔═══════════════════════════════════════════════════════════════╗');
      console.log('║          ❌ EMAIL FAILED TO SEND                              ║');
      console.log('╚═══════════════════════════════════════════════════════════════╝');
      console.log('');
      console.log('Check:');
      console.log('  1. Email credentials in .env (EMAIL_USER, EMAIL_PASSWORD)');
      console.log('  2. Gmail security settings - may need App Password');
      console.log('  3. Server logs for error details');
      console.log('');
    }

    process.exit(result ? 0 : 1);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testInvoiceEmail();
