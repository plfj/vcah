#!/usr/bin/env node

import { HashBasedAuthService } from '../src/server/services/hash-based-auth.service';

/**
 * Generate API Key Script
 *
 * Generates API keys using PYVM_SEC_KEY environment variable
 */

const userId = process.argv[2] || 'default_user';
const permissions = process.argv[3] ? process.argv[3].split(',') : ['obfuscate'];
const rateLimit = parseInt(process.argv[4] || '100');
const expiresInDays = parseInt(process.argv[5] || '365');

console.log('═'.repeat(70));
console.log('  PYVM API KEY GENERATOR');
console.log('═'.repeat(70));

// Get secret info
const secretInfo = HashBasedAuthService.getCurrentSecretInfo();

console.log('\nSecret Configuration:');
console.log('  Source:', secretInfo.source);
console.log('  Secret Key:', secretInfo.secretKey === 'ATOMIC_PYVM'
  ? 'ATOMIC_PYVM (DEFAULT)'
  : secretInfo.secretKey.slice(0, 20) + '...');
console.log('  Secret Hash:', secretInfo.secretHash.slice(0, 32) + '...');

if (secretInfo.source === 'DEFAULT') {
  console.log('\n⚠️  WARNING: Using default secret key!');
  console.log('   For production, set PYVM_SEC_KEY environment variable:');
  console.log('   export PYVM_SEC_KEY="your-secure-secret-here"');
}

console.log('\n' + '─'.repeat(70));
console.log('Generating API Key...');
console.log('─'.repeat(70));

// Generate API key
const expiresIn = expiresInDays * 24 * 60 * 60 * 1000;
const { apiKey, keyHash, secretKey } = HashBasedAuthService.createApiKey(
  userId,
  permissions,
  rateLimit,
  expiresIn
);

console.log('\n✓ API Key Generated Successfully\n');

console.log('API Key Details:');
console.log('─'.repeat(70));
console.log('User ID:', userId);
console.log('Permissions:', permissions.join(', '));
console.log('Rate Limit:', rateLimit, 'requests/minute');
console.log('Expires In:', expiresInDays, 'days');
console.log('Key Hash:', keyHash.slice(0, 32) + '...');

console.log('\n' + '═'.repeat(70));
console.log('  🔑 YOUR API KEY (SAVE THIS SECURELY)');
console.log('═'.repeat(70));
console.log('\n' + apiKey + '\n');
console.log('═'.repeat(70));

console.log('\n⚠️  IMPORTANT SECURITY NOTES:');
console.log('  1. This API key will NOT be shown again');
console.log('  2. Store it in a secure location (password manager, env var)');
console.log('  3. Never commit it to version control');
console.log('  4. If PYVM_SEC_KEY changes, this key will become invalid');

console.log('\n📋 USAGE EXAMPLE:');
console.log('─'.repeat(70));
console.log('curl -X POST http://localhost:3000/api/obfuscate-secure \\');
console.log('  -H "Content-Type: application/json" \\');
console.log('  -H "X-API-Key: ' + apiKey + '" \\');
console.log('  -d \'{"sourceCode":"print(\\"Hello\\")","useAtomicGrade":true}\'');

console.log('\n' + '═'.repeat(70));
console.log('  Generation Complete');
console.log('═'.repeat(70));
