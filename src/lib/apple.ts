import jwt from 'jsonwebtoken';

/**
 * Generate an Apple client secret JWT.
 *
 * Apple requires the client secret to be a JWT signed with the
 * private key downloaded from the Apple Developer portal.
 *
 * Required env vars:
 *   APPLE_CLIENT_ID   - Services ID (e.g. com.example.gateo)
 *   APPLE_TEAM_ID     - Apple Developer Team ID
 *   APPLE_KEY_ID      - Key ID from the private key
 *   APPLE_PRIVATE_KEY - The .p8 private key content (can be base64 encoded)
 */
export function generateAppleClientSecret(): string {
  const clientId = process.env.APPLE_CLIENT_ID;
  const teamId = process.env.APPLE_TEAM_ID;
  const keyId = process.env.APPLE_KEY_ID;
  let privateKey = process.env.APPLE_PRIVATE_KEY;

  if (!clientId || !teamId || !keyId || !privateKey) {
    throw new Error(
      'Apple Sign In is not configured. Set APPLE_CLIENT_ID, APPLE_TEAM_ID, APPLE_KEY_ID and APPLE_PRIVATE_KEY.'
    );
  }

  // Support base64-encoded keys to make multi-line env vars easier
  if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
    try {
      const decoded = Buffer.from(privateKey, 'base64').toString('utf-8');
      if (decoded.includes('-----BEGIN PRIVATE KEY-----')) {
        privateKey = decoded;
      }
    } catch {
      // keep original value; jsonwebtoken will throw a clearer error below
    }
  }

  const now = Math.floor(Date.now() / 1000);

  return jwt.sign(
    {
      iss: teamId,
      iat: now,
      exp: now + 180 * 24 * 60 * 60, // 180 days (Apple allows up to 6 months)
      aud: 'https://appleid.apple.com',
      sub: clientId,
    },
    privateKey,
    {
      algorithm: 'ES256',
      header: {
        alg: 'ES256',
        kid: keyId,
      },
    }
  );
}
