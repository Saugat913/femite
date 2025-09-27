#!/usr/bin/env node

// Test email functionality
require('dotenv').config({ path: '.env.local' });

const nodemailer = require('nodemailer');

async function testEmailConnection() {
  console.log('Testing email configuration...\n');
  
  // Check if all required environment variables are set
  const requiredVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing.join(', '));
    return false;
  }
  
  console.log('📧 SMTP Configuration:');
  console.log(`Host: ${process.env.SMTP_HOST}`);
  console.log(`Port: ${process.env.SMTP_PORT}`);
  console.log(`User: ${process.env.SMTP_USER}`);
  console.log(`Password: ${process.env.SMTP_PASSWORD ? '***' + process.env.SMTP_PASSWORD.slice(-4) : 'not set'}\n`);
  
  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    },
    debug: true, // Enable debug output
    logger: true // Enable logging
  });
  
  try {
    console.log('🔍 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!\n');
    
    // Test sending email
    console.log('📬 Sending test email...');
    const testEmail = {
      from: `"Femite Test" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // Send to self
      subject: '🧪 Test Email - Femite Password Reset Service',
      text: 'This is a test email to verify the email service is working correctly.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #4a7c59;">🧪 Email Service Test</h2>
          <p>This is a test email to verify that the Femite email service is working correctly.</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            If you received this email, your SMTP configuration is working properly.
          </p>
        </div>
      `
    };
    
    const info = await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully!');
    console.log('📨 Message ID:', info.messageId);
    if (info.response) {
      console.log('📡 Server response:', info.response);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.error('🔍 Full error:', error);
    return false;
  }
}

// Run the test
testEmailConnection()
  .then(success => {
    if (success) {
      console.log('\n🎉 Email service is working correctly!');
      process.exit(0);
    } else {
      console.log('\n💥 Email service test failed. Please check your configuration.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n💥 Unexpected error:', error);
    process.exit(1);
  });