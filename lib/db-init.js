// This file should be imported early in the application's startup process
// to configure Node.js environment variables for SSL certificate handling

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

console.log('SSL certificate verification disabled for development/testing');