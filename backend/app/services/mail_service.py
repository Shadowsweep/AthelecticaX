import os
from typing import List
from pydantic import EmailStr
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
from ..core.config import settings

# In sandbox / local development, we fallback to printing the email body directly to console
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))

# Simple check to see if SMTP configs are active
IS_MAIL_ENABLED = bool(SMTP_USER and SMTP_PASSWORD and SMTP_HOST)

mail_config = ConnectionConfig(
    MAIL_USERNAME=SMTP_USER,
    MAIL_PASSWORD=SMTP_PASSWORD,
    MAIL_FROM=os.getenv("SMTP_FROM", "noreply@athleticax.com"),
    MAIL_PORT=SMTP_PORT,
    MAIL_SERVER=SMTP_HOST,
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

async def _send_mail(recipient_email: str, subject: str, html_body: str, attachment_path: str | None = None):
    if IS_MAIL_ENABLED:
        try:
            message = MessageSchema(
                subject=subject,
                recipients=[recipient_email],
                body=html_body,
                subtype=MessageType.html,
                attachments=[attachment_path] if attachment_path else [],
            )
            fm = FastMail(mail_config)
            await fm.send_message(message)
            print(f"[MAILER] Email successfully sent to {recipient_email}")
        except Exception as e:
            print(f"[MAILER ERROR] Failed to send email to {recipient_email}: {e}")
            print(f"[MAILER FALLBACK] Printing email below:")
            _print_email_payload(recipient_email, subject, html_body)
    else:
        # Fallback print to logs
        _print_email_payload(recipient_email, subject, html_body)

def _print_email_payload(recipient_email: str, subject: str, html_body: str):
    print("=" * 80)
    print(f"SMTP NOT CONFIGURED // FALLBACK MAIL TRANSMISSION LOG")
    print(f"TO:      {recipient_email}")
    print(f"SUBJECT: {subject}")
    print("-" * 80)
    print(html_body)
    print("=" * 80)

async def send_approval_email(recipient_email: str, name: str, employee_code: str, ticket_path: str | None = None):
    subject = "ATHLETICAX // ACCOUNT ACCESS AUTHORIZED"
    html_body = f"""
    <html>
        <body style="font-family: Arial, sans-serif; background-color: #0A0E17; color: #F1F5F9; padding: 20px;">
            <div style="border: 1px solid #1E293B; background-color: #111625; padding: 30px; border-top: 3px solid #00E5FF;">
                <h1 style="color: #00E5FF; font-size: 24px; letter-spacing: 2px;">ATHLETICAX GATEWAY ACCESS</h1>
                <p>Congratulations <strong>{name}</strong>!</p>
                <p>We are pleased to inform you that your account registration request has been reviewed and <strong>APPROVED</strong> by the platform administrator.</p>
                <p>Your Employee ID is <strong style="color: #00E5FF;">{employee_code}</strong>.</p>
                <p>You can now log in to the command dashboard and configure your profile metrics.</p>
                <br/>
                <a href="{settings.FRONTEND_URL}/login" style="display: inline-block; padding: 12px 24px; background-color: #00E5FF; color: #0A0E17; text-decoration: none; font-weight: bold; border-radius: 0px;">INITIATE DASHBOARD SESSION</a>
                <br/>
                <p style="font-size: 11px; color: #94A3B8; margin-top: 20px;">// SYSTEM SECURED VIA JWT PROTOCOLS</p>
            </div>
        </body>
    </html>
    """
    await _send_mail(recipient_email, subject, html_body, ticket_path)

async def send_rejection_email(recipient_email: str, name: str, reason: str):
    subject = "ATHLETICAX // ACCOUNT ACCESS DENIED"
    html_body = f"""
    <html>
        <body style="font-family: Arial, sans-serif; background-color: #0A0E17; color: #F1F5F9; padding: 20px;">
            <div style="border: 1px solid #1E293B; background-color: #111625; padding: 30px; border-top: 3px solid #FF007F;">
                <h1 style="color: #FF007F; font-size: 24px; letter-spacing: 2px;">ATHLETICAX GATEWAY ACCESS DENIED</h1>
                <p>Hello <strong>{name}</strong>,</p>
                <p>Your registration request has been reviewed and <strong>REJECTED</strong> for the following reason:</p>
                <blockquote style="border-left: 3px solid #FF007F; padding-left: 15px; margin: 15px 0; color: #FF007F;">
                    {reason}
                </blockquote>
                <p>Please contact your HR department or the administrator to correct your credentials.</p>
                <br/>
                <p style="font-size: 11px; color: #94A3B8; margin-top: 20px;">// SYSTEM SECURED VIA JWT PROTOCOLS</p>
            </div>
        </body>
    </html>
    """
    await _send_mail(recipient_email, subject, html_body)
