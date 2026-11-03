import nodemailer from 'nodemailer';
export const mail=(to,subject,text,attachments)=>{if(!process.env.FIELD_DOCS_SMTP_HOST)throw new Error('SMTP not configured');
 return nodemailer.createTransport({host:process.env.FIELD_DOCS_SMTP_HOST,port:+(process.env.FIELD_DOCS_SMTP_PORT||587),secure:process.env.FIELD_DOCS_SMTP_PORT==='465',auth:process.env.FIELD_DOCS_SMTP_USER?{user:process.env.FIELD_DOCS_SMTP_USER,pass:process.env.FIELD_DOCS_SMTP_PASS}:undefined}).sendMail({from:process.env.FIELD_DOCS_MAIL_FROM,to,subject,text,attachments})};
