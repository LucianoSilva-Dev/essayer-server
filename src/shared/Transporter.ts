import { createTransport } from 'nodemailer';
import mailjetTransport from 'nodemailer-mailjet-transport';
import { SMTP_KEY, SMTP_SECRET } from './Env';
import hbs from 'nodemailer-express-handlebars';
import path from 'path';

export const Transporter = createTransport(
  mailjetTransport({
    auth: {
      apiKey: SMTP_KEY,
      apiSecret: SMTP_SECRET,
    },
  }),
);

const templatesPath = path.resolve(__dirname, 'templates');

Transporter.use(
  'compile',
  hbs({
    viewEngine: {
      defaultLayout: '',
    },
    // Use absolute path so templates are found regardless of cwd
    viewPath: templatesPath,
    extName: '.hbs',
  }),
);
