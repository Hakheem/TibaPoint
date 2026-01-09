// test-same-channel.js - ALWAYS use same channel
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

const APP_ID = 'ca71d48e543f496081f91c258e4aaee8';
const CERT = 'ba298c2854ab4121bd6c38a936a27206';
const CHANNEL = 'test_channel_1767956050194'; // FIXED: Always same channel

function generateToken(userId) {
  const uid = Number(userId);
  const role = RtcRole.PUBLISHER;
  const expireTime = Math.floor(Date.now() / 1000) + 3600;
  
  return RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    CERT,
    CHANNEL, // Same channel every time
    uid,
    role,
    expireTime
  );
}

console.log('=== SAME CHANNEL TEST ===');
console.log(`Fixed Channel: ${CHANNEL}`);
console.log('');

// Generate for first user (doctor)
const token1 = generateToken(62984);
console.log('👨‍⚕️ USER 1 (Doctor):');
console.log(`UID: 62984`);
console.log(`Token: ${token1}`);
console.log('');

// Generate for second user (patient)
const token2 = generateToken(62985);
console.log('👤 USER 2 (Patient):');
console.log(`UID: 62985`);
console.log(`Token: ${token2}`);
console.log('');

console.log('📋 TEST INSTRUCTIONS:');
console.log('1. Tab 1: Use UID 62984 and Token above');
console.log('2. Tab 2: Use UID 62985 and Token above');
console.log('3. BOTH use SAME channel:', CHANNEL);
console.log('4. Join both tabs - you should see each other!');

