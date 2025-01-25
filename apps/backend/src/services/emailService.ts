const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

const createTransporter = () => {
   if (process.env.NODE_ENV !== 'prod') {
      return nodemailer.createTransport({
         host: process.env.MAIL_HOST || 'localhost',
         port: parseInt(process.env.MAIL_PORT || '1025'),
      });
   } else {
      return nodemailer.createTransport({
         service: 'gmail',
         auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
         },
      });
   }
};

const transporter = createTransporter();

const compileTemplate = (templateName: string, context: Record<string, any>): string => {
   const filePath = path.join(__dirname, '..', 'templates', `${templateName}.hbs`);
   const templateSource = fs.readFileSync(filePath, 'utf8');
   const template = handlebars.compile(templateSource);
   return template(context);
};

const sendEmail = async (
   to: string,
   subject: string,
   templateName: string,
   context: Record<string, any>
) => {
   try {
      const html = compileTemplate(templateName, context);

      const mailOptions = {
         from: process.env.MAIL_FROM || 'no-reply@atom-challenge.local',
         to,
         subject,
         html,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Correo enviado a: ${to}`);
   } catch (error) {
      console.error('Error enviando correo:', error);
      throw error;
   }
};

export default { sendEmail };
