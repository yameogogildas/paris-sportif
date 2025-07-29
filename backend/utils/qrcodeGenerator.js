// utils/qrcodeGenerator.js
import QRCode from 'qrcode';

export const generateQRCode = async (otpauthUrl) => {
  try {
    return await QRCode.toDataURL(otpauthUrl);
  } catch (err) {
    throw new Error('Erreur lors de la génération du QR Code');
  }
};
