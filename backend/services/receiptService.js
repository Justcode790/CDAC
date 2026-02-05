/**
 * SUVIDHA 2026 - Receipt Generation Service
 * 
 * Generates PDF receipts for complaints with QR code
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate PDF receipt for a complaint
 * @param {Object} complaint - Complaint object with populated fields
 * @param {Object} citizen - Citizen user object
 * @returns {Promise<Buffer>} PDF buffer
 */
const generateComplaintReceipt = async (complaint, citizen) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];

      // Collect PDF data
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header - Government Branding
      doc.rect(0, 0, doc.page.width, 80).fill('#1e40af');
      
      doc.fillColor('#ffffff')
         .fontSize(28)
         .font('Helvetica-Bold')
         .text('SUVIDHA 2026', 50, 25);
      
      doc.fontSize(12)
         .font('Helvetica')
         .text('Smart Urban Virtual Interactive Digital Helpdesk Assistant', 50, 55);

      // Receipt Title
      doc.fillColor('#000000')
         .fontSize(20)
         .font('Helvetica-Bold')
         .text('COMPLAINT RECEIPT', 50, 110);

      doc.moveTo(50, 140)
         .lineTo(doc.page.width - 50, 140)
         .stroke('#1e40af');

      // Receipt Details
      let yPos = 160;

      // Complaint Number (Prominent)
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor('#1e40af')
         .text('Complaint Number:', 50, yPos);
      
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .fillColor('#000000')
         .text(complaint.complaintNumber, 250, yPos);

      yPos += 40;

      // Citizen Details
      const details = [
        { label: 'Citizen Name', value: citizen.name || 'N/A' },
        { label: 'Mobile Number', value: citizen.mobileNumber || 'N/A' },
        { label: 'Email', value: citizen.email || 'N/A' },
        { label: '', value: '' }, // Spacer
        { label: 'Complaint Title', value: complaint.title },
        { label: 'Category', value: complaint.category.replace(/_/g, ' ') },
        { label: 'Priority', value: complaint.priority },
        { label: 'Status', value: complaint.status },
        { label: '', value: '' }, // Spacer
        { label: 'Department', value: complaint.department?.name || 'N/A' },
        { label: 'Sub-Department', value: complaint.subDepartment?.name || 'N/A' },
        { label: '', value: '' }, // Spacer
        { label: 'Submitted On', value: new Date(complaint.createdAt).toLocaleString('en-IN', { 
          dateStyle: 'long', 
          timeStyle: 'short',
          timeZone: 'Asia/Kolkata'
        }) }
      ];

      doc.fontSize(11).font('Helvetica');

      details.forEach(detail => {
        if (!detail.label) {
          yPos += 10; // Spacer
          return;
        }

        doc.fillColor('#666666')
           .text(detail.label + ':', 50, yPos, { width: 180 });
        
        doc.fillColor('#000000')
           .font('Helvetica-Bold')
           .text(detail.value, 250, yPos, { width: 300 });
        
        doc.font('Helvetica');
        yPos += 25;
      });

      // Description Box
      yPos += 10;
      doc.fontSize(11)
         .fillColor('#666666')
         .text('Description:', 50, yPos);
      
      yPos += 20;
      doc.rect(50, yPos, doc.page.width - 100, 80)
         .stroke('#cccccc');
      
      doc.fontSize(10)
         .fillColor('#000000')
         .text(complaint.description, 60, yPos + 10, { 
           width: doc.page.width - 120,
           height: 60,
           ellipsis: true
         });

      yPos += 100;

      // QR Code Placeholder (Text-based for now)
      doc.fontSize(10)
         .fillColor('#666666')
         .text('Scan QR Code to track complaint:', 50, yPos);
      
      yPos += 20;
      doc.rect(50, yPos, 100, 100)
         .stroke('#cccccc');
      
      doc.fontSize(8)
         .text('QR Code', 70, yPos + 45);
      
      doc.fontSize(9)
         .text(`Track at: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/track`, 170, yPos + 20, { width: 300 });
      
      doc.text(`Complaint #: ${complaint.complaintNumber}`, 170, yPos + 40, { width: 300 });

      // Footer
      const footerY = doc.page.height - 100;
      
      doc.moveTo(50, footerY)
         .lineTo(doc.page.width - 50, footerY)
         .stroke('#cccccc');

      doc.fontSize(9)
         .fillColor('#666666')
         .text('Important Instructions:', 50, footerY + 10);
      
      doc.fontSize(8)
         .text('• Keep this receipt for your records', 50, footerY + 25);
      
      doc.text('• Track your complaint status online using the complaint number', 50, footerY + 38);
      
      doc.text('• For queries, contact your local municipal office', 50, footerY + 51);

      doc.fontSize(7)
         .fillColor('#999999')
         .text(`Generated on: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`, 50, footerY + 70);
      
      doc.text('This is a computer-generated receipt and does not require a signature.', 50, footerY + 82);

      // Finalize PDF
      doc.end();

    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generateComplaintReceipt
};
