import { createTransport } from 'nodemailer';
import mailjetTransport from 'nodemailer-mailjet-transport';
import { SMTP_KEY, SMTP_SECRET } from './Env';
import hbs from 'nodemailer-express-handlebars';

export const Transporter = createTransport(
  mailjetTransport({
    auth: {
      apiKey: SMTP_KEY,
      apiSecret: SMTP_SECRET,
    },
  }),
);

Transporter.use(
  'compile',
  hbs({
    viewEngine: {
      defaultLayout: '',
    },
    viewPath: 'src/shared/templates',
    extName: '.hbs',
  }),
);
