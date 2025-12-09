import nodemailer from "nodemailer";

// Create transporter with configuration from environment variables
const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.log("Email service not configured. Email notifications will be logged to console.");
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
};

let transporter = createTransporter();

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    if (!transporter) {
      console.log("📧 Email would be sent:", {
        to: options.to,
        subject: options.subject,
      });
      return true;
    }

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    
    console.log(`✅ Email sent to ${options.to}: ${options.subject}`);
    return true;
  } catch (error) {
    console.error("❌ Failed to send email:", error);
    return false;
  }
}

export async function sendTicketCreatedEmail(
  userEmail: string,
  userName: string,
  ticketId: string,
  ticketTitle: string
): Promise<void> {
  await sendEmail({
    to: userEmail,
    subject: `[HelpDeskPro] Ticket Created: ${ticketTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Your Support Ticket Has Been Created</h2>
        <p>Hello ${userName},</p>
        <p>Your support ticket has been successfully created and our team will review it shortly.</p>
        <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0;"><strong>Ticket ID:</strong> #${ticketId.slice(0, 8)}</p>
          <p style="margin: 8px 0 0;"><strong>Title:</strong> ${ticketTitle}</p>
        </div>
        <p>We'll notify you when there's an update on your ticket.</p>
        <p style="color: #6b7280; font-size: 14px;">Thank you for using HelpDeskPro.</p>
      </div>
    `,
  });
}

export async function sendTicketResponseEmail(
  userEmail: string,
  userName: string,
  ticketId: string,
  ticketTitle: string,
  agentName: string,
  comment: string
): Promise<void> {
  await sendEmail({
    to: userEmail,
    subject: `[HelpDeskPro] New Response: ${ticketTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Response on Your Ticket</h2>
        <p>Hello ${userName},</p>
        <p>An agent has responded to your support ticket.</p>
        <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0;"><strong>Ticket:</strong> #${ticketId.slice(0, 8)} - ${ticketTitle}</p>
          <p style="margin: 8px 0;"><strong>Response from:</strong> ${agentName}</p>
          <div style="background-color: white; padding: 12px; border-radius: 4px; margin-top: 8px;">
            <p style="margin: 0; white-space: pre-wrap;">${comment}</p>
          </div>
        </div>
        <p>Log in to view the full conversation and respond.</p>
        <p style="color: #6b7280; font-size: 14px;">Thank you for using HelpDeskPro.</p>
      </div>
    `,
  });
}

export async function sendTicketClosedEmail(
  userEmail: string,
  userName: string,
  ticketId: string,
  ticketTitle: string
): Promise<void> {
  await sendEmail({
    to: userEmail,
    subject: `[HelpDeskPro] Ticket Closed: ${ticketTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Your Ticket Has Been Closed</h2>
        <p>Hello ${userName},</p>
        <p>Your support ticket has been marked as closed.</p>
        <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0;"><strong>Ticket ID:</strong> #${ticketId.slice(0, 8)}</p>
          <p style="margin: 8px 0 0;"><strong>Title:</strong> ${ticketTitle}</p>
        </div>
        <p>If you need further assistance on this matter, you can create a new ticket.</p>
        <p style="color: #6b7280; font-size: 14px;">Thank you for using HelpDeskPro.</p>
      </div>
    `,
  });
}

export async function sendReminderEmail(
  agentEmail: string,
  agentName: string,
  unansweredTickets: Array<{ id: string; title: string; priority: string; hoursOld: number }>
): Promise<void> {
  const ticketList = unansweredTickets
    .map(t => `<li><strong>#${t.id.slice(0, 8)}</strong> - ${t.title} (${t.priority} priority, ${t.hoursOld}h old)</li>`)
    .join("");

  await sendEmail({
    to: agentEmail,
    subject: `[HelpDeskPro] Reminder: ${unansweredTickets.length} Unanswered Tickets`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">Unanswered Tickets Reminder</h2>
        <p>Hello ${agentName},</p>
        <p>The following tickets have not received a response and need your attention:</p>
        <ul style="background-color: #f3f4f6; padding: 16px 32px; border-radius: 8px;">
          ${ticketList}
        </ul>
        <p>Please log in to review and respond to these tickets.</p>
        <p style="color: #6b7280; font-size: 14px;">HelpDeskPro System</p>
      </div>
    `,
  });
}
