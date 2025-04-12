
import { type Member } from "../types/member";
import { toast } from "../components/ui/sonner";

// EmailJS credentials
const serviceId = "service_s3ek2ky";
const templateId = "template_1nv590n";
const publicKey = "H-8V_wOp5vS_BD8gO";

interface EmailParams {
  user_name: string;
  user_email: string;
  message: string;
  subject: string;
  [key: string]: unknown;
}

// This function sends an email to the member
export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    // Send email to the member
    const memberResponse = await window.emailjs.send(
      serviceId,
      templateId,
      params,
      publicKey
    );
    
    if (memberResponse.status === 200) {
      toast.success("Email sent successfully to member");
      return true;
    } else {
      toast.error("Failed to send email");
      return false;
    }
  } catch (error) {
    console.error("Error sending email:", error);
    toast.error("Failed to send email");
    return false;
  }
}

export function sendWelcomeEmail(member: Member): Promise<boolean> {
  const params: EmailParams = {
    user_name: member.fullName,
    user_email: member.email,
    subject: "Welcome to Royal Fitness Gym!",
    message: `Dear ${member.fullName},\n\nWelcome to Royal Fitness Gym! Your membership has been activated and will expire in ${member.subscriptionDuration} days.\n\nThank you for choosing Royal Fitness Gym.\n\nBest regards,\nRoyal Fitness Team`
  };
  
  return sendEmail(params);
}

export function sendPaymentReminderEmail(
  member: Member, 
  daysLeft: number
): Promise<boolean> {
  const params: EmailParams = {
    user_name: member.fullName,
    user_email: member.email,
    subject: `Royal Fitness Gym - Your membership expires in ${daysLeft} days`,
    message: `Dear ${member.fullName},\n\nThis is a friendly reminder that your Royal Fitness Gym membership will expire in ${daysLeft} days.\n\nPlease renew your subscription to continue enjoying our services.\n\nBest regards,\nRoyal Fitness Team`
  };
  
  return sendEmail(params);
}

