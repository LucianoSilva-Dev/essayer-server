import { createTransport } from 'nodemailer';
import mailjetTransport from 'nodemailer-mailjet-transport';
import { SMTP_KEY, SMTP_SECRET } from './Env';

export const Transporter = createTransport(
  mailjetTransport({
    auth: {
      apiKey: SMTP_KEY,
      apiSecret: SMTP_SECRET,
    },
  }),
);

export const createCodeEmail = (code: string) => {
  return `<p>Código: ${code}</p>`;
};

export const createApproveEmail = () => {
  return '<h1>Aprovado</h1>';
};

export const createRejectEmail = (motivo?: string) => {
  return `
    <h1>Recusado</h1>
    <p>Motivo: ${motivo}</p>
  `;
};

export const createNotificationEmail = () => {
  return '<p>Requisição Recebida!<br></br>mais detalhes serão enviados por e-mail</p>';
};
