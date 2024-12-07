const PDFDocument = require('pdfkit');
const fs = require('fs');
const QRCode = require('qrcode');
const path = require('path');
const nodemailer = require("nodemailer");



// Function to generate a QR code image
const generateQRCodeImage = async (qrCodeData) => {
    const filePath = path.join(__dirname, 'qr_codes', `${qrCodeData}.png`);
    await QRCode.toFile(filePath, qrCodeData);
    return filePath;
};
const generateTicketPDF = async (userData, eventData, ticketData) => {
    const doc = new PDFDocument();

    // Save the generated PDF to a file (or stream it directly to the response)
    const filePath = `./ticket_booking_${ticketData._id}.pdf`;

    doc.pipe(fs.createWriteStream(filePath));  // This will save it to the local filesystem

    // Title and Header
    doc.fontSize(20).text('Ticket Booking Confirmation', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Booking ID: ${ticketData._id}`);
    doc.text(`Event: ${eventData.eventName}`);
    doc.text(`Date: ${eventData.eventDate}`);
    doc.text(`Tickets Booked: ${ticketData.quantity}`);
    doc.text(`Booking Date: ${ticketData.bookingDate}`);
    doc.text(`Booking status: ${ticketData.status}`);
  
    
    // Generate and embed QR code
    const qrCodeImagePath = await generateQRCodeImage(ticketData.qrCode);
    doc.image(qrCodeImagePath, { width: 100, height: 100 });

    // User Information
    doc.moveDown(15); 
    doc.fontSize(14).text('User Information:');
   
    doc.fontSize(12).text(`Name: ${userData.name}`);
    doc.text(`Email: ${userData.email}`);

    // Finish the document
    doc.end();

    // Return the file path or a stream for email attachment
    return filePath;
};



const sendEmailWithAttachment = async (toEmail, filePath) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL, // Your email
            pass: process.env.EMAIL_PASSWORD // Your email password
        }
    });

    const mailOptions = {
        from: `"Shourya 👻" <${process.env.EMAIL}>`,
        to: toEmail,
        subject: 'Ticket Booking Confirmation',
        text: 'Thank you for your booking. Your ticket details are attached.',
        attachments: [
            {
                filename: `ticket_booking_${filePath.split('_')[2]}.pdf`,
                path: filePath
            }
        ]
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

module.exports = {
    sendEmailWithAttachment,
    generateTicketPDF
}