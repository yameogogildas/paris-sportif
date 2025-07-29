import speakeasy from 'speakeasy';
import { generateQRCode } from './qrcodeGenerator.js';

export const generate2FA = async (userEmail) => {
  const secret = speakeasy.generateSecret({
    name: `GAMBLERS - ${userEmail}`,
  });

  const qrCodeUrl = await generateQRCode(secret.otpauth_url);

  return { secret: secret.base32, qrCodeUrl };
};

export const verify2FA = (secret, token) => {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 1,
  });
};
