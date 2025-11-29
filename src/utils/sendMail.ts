const nodemailer = require('nodemailer');

const sendEmail = async (options: { to: any; subject: any; text: any; }) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME, 
      pass: process.env.EMAIL_PASSWORD, 
    },
  });

  const mailOptions = {
    from: 'SmartNotes AI <noreply@smartnotes.com>',
    to: options.to,
    subject: options.subject,
    html: options.text,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;