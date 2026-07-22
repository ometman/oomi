import nodemailer from 'nodemailer';
import type { PreparedSubmission } from './form-submissions';

let transporter: ReturnType<typeof nodemailer.createTransport> | undefined;

export async function deliverSubmission(submission: PreparedSubmission, reference: string) {
  const user = import.meta.env.GOOGLE_SMTP_USER;
  const password = import.meta.env.GOOGLE_APP_PASSWORD;
  const recipient = import.meta.env.FORM_DELIVERY_EMAIL || 'hello@ometomeni.org';
  if (!user || !password) throw new Error('Mail delivery is not configured.');

  transporter ??= nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user, pass: password.replace(/\s/g, '') },
  });

  await transporter.sendMail({
    from: `Omet Omeni Website <${user}>`,
    to: recipient,
    replyTo: submission.replyTo,
    subject: submission.subject,
    text: `Reference: ${reference}\nSubmitted through: ometomeni.org\n\n${submission.text}`,
  });
}
