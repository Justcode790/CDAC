/**
 * SUVIDHA 2026 - PDF Receipt Generator
 * 
 * Generates professional PDF receipts for complaint registration
 * Includes QR code for easy tracking
 */

const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

/**
 * Generate complaint receipt PDF
 */
const generateComplaintReceipt = async (complaint, citizen) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Create PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      // Collect PDF data in buffer
      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Generate QR code
      const trackingUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/track?id=${complaint.complaintNumber}`;
      const qrCodeDataUrl = await QRCode.toDataURL(trackingUrl, {
        width: 150,
        margin: 1,
        errorCorrectionLevel: 'H'
      });

      // Header Section
      doc.fontSize(24)
         .font('Helvetica-Bold')
         .text('SUVIDHA 2026', { align: 'center' });
      
      doc.fontSize(12)
         .font('Helvetica')
         .text('Smart Urban Virtual Interactive Digital Helpdesk Assistant', { align: 'center' });
      
      doc.fontSize(10)
         .text('Government of India | Ministry of Electronics and IT', { align: 'center' });
      
      doc.moveDown(0.5);
      doc.moveTo(50, doc.y)
         .lineTo(545, doc.y)
         .stroke();
      doc.moveDown(1);

      // Title
      doc.fontSize(18)
         .font('Helvetica-Bold')
         .fillColor('#1e40af')
         .text('COMPLAINT RECEIPT', { align: 'center' });
      
      doc.fillColor('#000000');
      doc.moveDown(1);

      // Complaint Number Box
      doc.rect(50, doc.y, 495, 40)
         .fillAndStroke('#e0e7ff', '#4f46e5');
      
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor('#1e40af')
         .text(`Complaint No: ${complaint.complaintNumber}`, 60, doc.y + 12);
      
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#000000')
         .text(`Date: ${new Date(complaint.createdAt).toLocaleString('en-IN', {
           day: '2-digit',
           month: 'short',
           year: 'numeric',
           hour: '2-digit',
           minute: '2-digit'
         })}`, 60, doc.y + 10);
      
      doc.moveDown(2);

      // Citizen Details Section
      drawSection(doc, 'Citizen Details');
      drawField(doc, 'Name', citizen.name || 'N/A');
      drawField(doc, 'Mobile', citizen.mobileNumber || 'N/A');
      if (citizen.email) {
        drawField(doc, 'Email', citizen.email);
      }
      if (citizen.address) {
        drawField(doc, 'Address', citizen.address, true);
      }
      doc.moveDown(0.5);

      // Complaint Details Section
      drawSection(doc, 'Complaint Details');
      drawField(doc, 'Category', complaint.category?.replace(/_/g, ' ') || 'N/A');
      drawField(doc, 'Priority', complaint.priority || 'Medium');
      drawField(doc, 'Department', complaint.department?.name || 'N/A');
      drawField(doc, 'Sub-Department', complaint.subDepartment?.name || 'N/A');
      doc.moveDown(0.5);

      // Description
      drawSection(doc, 'Description');
      doc.fontSize(10)
         .font('Helvetica')
         .text(complaint.description || 'No description provided', {
           width: 495,
           align: 'justify'
         });
      doc.moveDown(0.5);

      // Location
      if (complaint.location?.address) {
        drawSection(doc, 'Location');
        doc.fontSize(10)
           .font('Helvetica')
           .text(complaint.location.address, { width: 495 });
        if (complaint.location.latitude && complaint.location.longitude) {
          doc.fontSize(9)
             .fillColor('#666666')
             .text(`Coordinates: ${complaint.location.latitude}, ${complaint.location.longitude}`);
          doc.fillColor('#000000');
        }
        doc.moveDown(0.5);
      }

      // Documents
      if (complaint.documents && complaint.documents.length > 0) {
        drawField(doc, 'Documents Attached', `${complaint.documents.length} file(s)`);
        doc.moveDown(0.5);
      }

      // Status Section
      drawSection(doc, 'Status Information');
      drawField(doc, 'Current Status', complaint.status || 'PENDING');
      drawField(doc, 'Expected Resolution', '3-5 working days');
      doc.moveDown(1);

      // QR Code Section
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('Track Your Complaint', { align: 'center' });
      
      doc.moveDown(0.5);

      // Add QR code
      doc.image(qrCodeDataUrl, (doc.page.width - 150) / 2, doc.y, {
        width: 150,
        height: 150
      });
      
      doc.moveDown(10);
      
      doc.fontSize(10)
         .font('Helvetica')
         .text('Scan QR code or visit:', { align: 'center' });
      
      doc.fontSize(9)
         .fillColor('#1e40af')
         .text(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/track`, { align: 'center' });
      
      doc.fillColor('#000000')
         .text(`Enter Complaint No: ${complaint.complaintNumber}`, { align: 'center' });
      
      doc.moveDown(1);

      // Footer
      doc.moveTo(50, doc.y)
         .lineTo(545, doc.y)
         .stroke();
      
      doc.moveDown(0.5);
      
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .text('Helpline & Support', { align: 'center' });
      
      doc.fontSize(9)
         .font('Helvetica')
         .text('Toll-Free: 1800-XXX-XXXX | Email: support@suvidha.gov.in', { align: 'center' });
      
      doc.fontSize(8)
         .fillColor('#666666')
         .text('This is a computer-generated receipt and does not require a signature.', { align: 'center' });

      // Finalize PDF
      doc.end();

    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Helper function to draw section header
 */
function drawSection(doc, title) {
  doc.fontSize(11)
     .font('Helvetica-Bold')
     .fillColor('#1e40af')
     .text(title);
  
  doc.moveTo(50, doc.y + 2)
     .lineTo(545, doc.y + 2)
     .strokeColor('#cbd5e1')
     .stroke();
  
  doc.fillColor('#000000')
     .strokeColor('#000000');
  
  doc.moveDown(0.5);
}

/**
 * Helper function to draw field
 */
function drawField(doc, label, value, multiline = false) {
  doc.fontSize(9)
     .font('Helvetica-Bold')
     .text(`${label}: `, { continued: !multiline });
  
  doc.font('Helvetica')
     .text(value, { width: multiline ? 495 : undefined });
  
  if (!multiline) {
    doc.moveDown(0.3);
  }
}

module.exports = {
  generateComplaintReceipt
};
