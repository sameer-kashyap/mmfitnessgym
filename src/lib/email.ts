
import { type Member } from "../types/member";
import { toast } from "../components/ui/sonner";

// EmailJS credentials
const serviceId = "service_s3ek2ky";
const userTemplateId = "template_saaskwi"; // Template for user emails
const adminTemplateId = "template_1nv590n"; // Template for admin emails
const publicKey = "H-8V_wOp5vS_BD8gO";
const adminEmail = "{{from_email}}"; // Admin email placeholder that EmailJS will replace

interface EmailParams {
  user_name: string;
  user_email: string;
  message: string;
  subject: string;
  [key: string]: unknown;
}

// This function sends an email to the member
export async function sendEmail(params: EmailParams, isAdminNotification = false): Promise<boolean> {
  try {
    // Check if emailjs is available
    if (!window.emailjs) {
      console.error("EmailJS is not loaded");
      toast.error("Email service not available");
      return false;
    }
    
    // Select the appropriate template
    const templateId = isAdminNotification ? adminTemplateId : userTemplateId;
    
    console.log(`Sending email with ${isAdminNotification ? 'admin' : 'user'} template:`, params);
    
    // Send email using the selected template
    const response = await window.emailjs.send(
      serviceId,
      templateId,
      params,
      publicKey
    );
    
    console.log("Email send response:", response);
    
    if (response.status === 200) {
      toast.success(`Email sent successfully to ${isAdminNotification ? 'admin' : 'member'}`);
      
      // Store the email data locally
      const sentEmails = JSON.parse(localStorage.getItem('sent-emails') || '[]');
      sentEmails.push({
        timestamp: new Date().toISOString(),
        recipient: isAdminNotification ? adminEmail : params.user_email,
        subject: params.subject,
        template: isAdminNotification ? 'admin' : 'user',
        status: 'sent'
      });
      localStorage.setItem('sent-emails', JSON.stringify(sentEmails));
      
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
  // Send email to the member
  const memberParams: EmailParams = {
    user_name: member.fullName,
    user_email: member.email,
    subject: "Welcome to Royal Fitness Gym!",
    message: `Dear ${member.fullName},\n\nWelcome to Royal Fitness Gym! Your membership has been activated and will expire in ${member.subscriptionDuration} days.\n\nThank you for choosing Royal Fitness Gym.\n\nBest regards,\nRoyal Fitness Team`
  };
  
  console.log("Sending welcome email to:", member.email);
  
  // Also send notification to admin
  const adminParams: EmailParams = {
    user_name: "Admin",
    user_email: adminEmail,
    subject: "New Member Registration",
    message: `A new member has registered:\n\nName: ${member.fullName}\nEmail: ${member.email}\nSubscription Duration: ${member.subscriptionDuration} days\nPayment Status: ${member.paymentStatus}`,
    member_name: member.fullName,
    member_email: member.email,
    subscription: `${member.subscriptionDuration} days`,
    payment: member.paymentStatus
  };
  
  // First send to member, then to admin
  return sendEmail(memberParams).then(memberSuccess => {
    if (memberSuccess) {
      console.log("Sending admin notification about new member");
      return sendEmail(adminParams, true);
    }
    return memberSuccess;
  });
}

export function sendPaymentReminderEmail(
  member: Member, 
  daysLeft: number
): Promise<boolean> {
  // Send reminder to member
  const memberParams: EmailParams = {
    user_name: member.fullName,
    user_email: member.email,
    subject: `Royal Fitness Gym - Your membership expires in ${daysLeft} days`,
    message: `Dear ${member.fullName},\n\nThis is a friendly reminder that your Royal Fitness Gym membership will expire in ${daysLeft} days.\n\nPlease renew your subscription to continue enjoying our services.\n\nBest regards,\nRoyal Fitness Team`
  };
  
  // Also notify admin about expiring membership
  const adminParams: EmailParams = {
    user_name: "Admin",
    user_email: adminEmail,
    subject: `Membership Expiring Soon - ${member.fullName}`,
    message: `A member's subscription is expiring soon:\n\nName: ${member.fullName}\nEmail: ${member.email}\nDays Left: ${daysLeft}\nPayment Status: ${member.paymentStatus}`,
    member_name: member.fullName,
    member_email: member.email,
    days_left: daysLeft.toString(),
    payment: member.paymentStatus
  };
  
  console.log("Sending reminder email to:", member.email);
  
  // First send to member, then to admin
  return sendEmail(memberParams).then(memberSuccess => {
    if (memberSuccess) {
      console.log("Sending admin notification about expiring membership");
      return sendEmail(adminParams, true);
    }
    return memberSuccess;
  });
}
