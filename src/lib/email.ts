
import { type Member } from "../types/member";
import { toast } from "../components/ui/sonner";

// EmailJS credentials
const serviceId = "service_s3ek2ky";
const userTemplateId = "template_1nv590n"; // Template for user welcome emails
const expiryTemplateId = "template_saaskwi"; // Template for expiry reminders
const adminTemplateId = "template_1nv590n"; // Template for admin emails
const publicKey = "H-8V_wOp5vS_BD8gO";
const adminEmail = "{{from_email}}"; // Admin email placeholder that EmailJS will replace

interface EmailParams {
  user_name: string;
  user_email: string;
  message: string;
  subject: string;
  joining_date?: string;
  expiry_date?: string;
  remaining_days?: string;
  gym_name?: string;
  sameer: string; // For {{sameer}} in From Name
  email: string; // For {{email}} in Reply To
  [key: string]: unknown;
}

// This function is now a stub since we're no longer sending emails
export async function sendEmail(): Promise<boolean> {
  console.log("Email sending is disabled");
  return false;
}

// This function is now a stub since we're no longer sending emails
export function sendWelcomeEmail(): Promise<boolean> {
  console.log("Welcome emails are disabled");
  return Promise.resolve(false);
}

// This function is now a stub since we're no longer sending emails
export function sendPaymentReminderEmail(): Promise<boolean> {
  console.log("Payment reminder emails are disabled");
  return Promise.resolve(false);
}
