import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'sandbox.smtp.mailtrap.io',
  port: 2525, // You can also use 25, 465, or 587
  auth: {
    user: '3f8ef859bccaee', // Your Mailtrap username
    pass: '1708476ca12249' // Your Mailtrap password (replace this with the actual password)
  }
});

export const sendMail = (to, subject, text, html) => {
  const mailOptions = {
    from: '3f8ef859bccaee@smtp.mailtrap.io', // Sender address
    to: to, // Recipient address
    subject: subject, // Subject line
    text: text, // Plain text body
    html: html // HTML body
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  });
};
