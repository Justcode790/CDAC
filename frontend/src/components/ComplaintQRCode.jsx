/**
 * SUVIDHA 2026 - Complaint QR Code Component
 * 
 * Displays QR code for complaint tracking
 * Allows download of QR code image
 */

import { QRCodeSVG } from 'qrcode.react';
import { Download, QrCode } from 'lucide-react';

const ComplaintQRCode = ({ complaintId, complaintNumber, size = 200, showDownload = true }) => {
  const trackingUrl = `${window.location.origin}/track?id=${complaintId || complaintNumber}`;
  const logoUrl = import.meta.env.VITE_LOGO_URL || '/logo.png';

  const downloadQRCode = () => {
    const svg = document.getElementById(`qr-${complaintNumber}`);
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      
      const downloadLink = document.createElement('a');
      downloadLink.download = `SUVIDHA_QR_${complaintNumber}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="p-4 bg-white rounded-2xl shadow-lg border-2 border-indigo-200">
        <QRCodeSVG
          id={`qr-${complaintNumber}`}
          value={trackingUrl}
          size={size}
          level="H"
          includeMargin={true}
          imageSettings={{
            src: logoUrl,
            height: size * 0.2,
            width: size * 0.2,
            excavate: true,
          }}
        />
      </div>
      
      <div className="text-center">
        <p className="text-sm font-bold text-slate-700 mb-1">
          Scan to Track Your Complaint
        </p>
        <p className="text-xs text-slate-500">
          Complaint No: {complaintNumber}
        </p>
      </div>

      {showDownload && (
        <button
          onClick={downloadQRCode}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
        >
          <Download size={16} />
          Download QR Code
        </button>
      )}
    </div>
  );
};

export default ComplaintQRCode;
