const router   = require('express').Router();
const Message  = require('../models/crm/Message');
const Contact  = require('../models/crm/Contact');
const Activity = require('../models/crm/Activity');

router.post('/', async (req, res) => {
  const { name, email, phone, company, interest, message } = req.body;
  if (!name || !email)
    return res.status(400).json({ error: 'Name and email are required' });

  try {
    const msg = await Message.create({ name, email, phone, company, interest, message });

    // ── CRM: auto-capture this enquiry as a Contact + log an Activity ──
    // Never blocks or fails the public form submission — best-effort only.
    try {
      const parts = name.trim().split(/\s+/);
      const [contact] = await Contact.findOrCreate({
        where: { email: email.toLowerCase().trim() },
        defaults: {
          firstName: parts[0] || name,
          lastName:  parts.slice(1).join(' '),
          phone:     phone || '',
          jobTitle:  '',
          source:    'website_form',
        },
      });
      await Activity.create({
        type:      'note',
        subject:   'Website enquiry' + (interest ? ': ' + interest : ''),
        body:      message || '',
        contactId: contact.id,
        createdBy: 'system',
      });
    } catch (crmErr) {
      console.warn('CRM auto-capture failed:', crmErr.message);
    }

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        });
        await transporter.sendMail({
          from:    `"Nanosoft Website" <${process.env.SMTP_USER}>`,
          to:      process.env.NOTIFY_EMAIL || process.env.SMTP_USER,
          subject: `New enquiry from ${name}`,
          html: `<h2>New enquiry</h2>
            <p><b>Name:</b> ${name}</p>
            <p><b>Email:</b> ${email}</p>
            <p><b>Phone:</b> ${phone || '—'}</p>
            <p><b>Company:</b> ${company || '—'}</p>
            <p><b>Interest:</b> ${interest || '—'}</p>
            <p><b>Message:</b><br>${(message || '').replace(/\n/g, '<br>')}</p>`,
        });
      } catch (emailErr) {
        console.warn('Email notification failed:', emailErr.message);
      }
    }

    res.status(201).json({ ok: true, id: msg.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save message' });
  }
});

module.exports = router;
