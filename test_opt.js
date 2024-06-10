import speakeasy from 'speakeasy';
// Replace with the secret from your database
const secret = 'LBGFESRUGBETUL3ZKRKDSJKTOZRV47KV'; // Update this with your actual secret

// Generate an OTP using the secret
const token = speakeasy.totp({
  secret: secret,
  encoding: 'base32'
});

console.log('Generated OTP:', token);

// Verify the OTP
const verified = speakeasy.totp.verify({
  secret: secret,
  encoding: 'base32',
  token: token
});

console.log('Is OTP verified?', verified);
