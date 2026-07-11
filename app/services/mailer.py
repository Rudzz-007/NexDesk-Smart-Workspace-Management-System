import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

class MailerService:
    def __init__(self):
        # Configured to look for environment flags; falls back to console logger safely if not set
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", 587))
        self.smtp_username = os.getenv("SMTP_USERNAME", "")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "")
        self.sender_email = os.getenv("SMTP_SENDER", "noreply@nexdesk.com")

    def send_booking_confirmation(self, user_email: str, booking_id: int, desk_id: str, start_time: datetime):
        """Sends a structured transactional confirmation notice to the customer."""
        subject = f"✨ NexDesk Reservation Confirmed — Booking #{booking_id}"
        
        # HTML Email Template Blueprint
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #2b6cb0;">Your Workspace is Ready!</h2>
                <p>Hello,</p>
                <p>Your reservation request has been processed successfully. Below are your space credentials:</p>
                <table style="border-collapse: collapse; width: 100%; max-width: 500px;">
                    <tr style="background-color: #f7fafc;">
                        <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Booking ID</td>
                        <td style="padding: 8px; border: 1px solid #e2e8f0;">#{booking_id}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Desk Identifier</td>
                        <td style="padding: 8px; border: 1px solid #e2e8f0; color: #2b6cb0; font-weight: bold;">{desk_id}</td>
                    </tr>
                    <tr style="background-color: #f7fafc;">
                        <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Start Time</td>
                        <td style="padding: 8px; border: 1px solid #e2e8f0;">{start_time.strftime('%Y-%m-%d %H:%M local')}</td>
                    </tr>
                </table>
                <p style="margin-top: 20px;">Please remember to generate your secure check-in QR token within your dashboard before arrival to avoid slot auto-release timeouts.</p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 30px;">
                <p style="font-size: 12px; color: #718096;">This is an automated operational notification from NexDesk Workspace Engine.</p>
            </body>
        </html>
        """

        print(f"[MAILER QUEUE] Preparing outbound email broadcast thread targeting: {user_email}")
        
        # If credentials aren't initialized yet, print to standard log out to bypass connection exceptions in local testing
        if not self.smtp_username or not self.smtp_password:
            print(f"[MAILER MOCK LOG] Outbound email targeting {user_email} sent successfully via console fallback.")
            return

        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = self.sender_email
            msg["To"] = user_email
            msg.attach(MIMEText(html_content, "html"))

            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.sendmail(self.sender_email, user_email, msg.as_string())
            print(f"[MAILER SUCCESS] Transactional confirmation delivered to {user_email} successfully.")
        except Exception as e:
            print(f"[MAILER FAILURE] Failed to broadcast email via network stack: {str(e)}")

mailer_service = MailerService()
