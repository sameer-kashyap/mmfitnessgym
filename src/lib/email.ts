
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
  joining_date?: string;
  expiry_date?: string;
  remaining_days?: string;
  gym_name?: string;
  sameer: string; // For {{sameer}} in From Name
  email: string; // For {{email}} in Reply To
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
    
    // Ensure required template parameters are set
    const emailParams = {
      ...params,
      sameer: "Royal Fitness Gym", // For {{sameer}} in From Name
      email: "abhaysam123456@gmail.com", // For {{email}} in Reply To
      gym_name: "Royal Fitness Gym",
    };
    
    console.log(`Sending email with ${isAdminNotification ? 'admin' : 'user'} template:`, emailParams);
    
    // Send email using the selected template
    const response = await window.emailjs.send(
      serviceId,
      templateId,
      emailParams,
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
  // Format joining date (startDate)
  const joiningDate = new Date(member.startDate).toLocaleDateString();
  
  // Calculate expiry date
  const expiryDate = new Date(new Date(member.startDate).getTime() + (member.subscriptionDuration * 24 * 60 * 60 * 1000));
  const formattedExpiryDate = expiryDate.toLocaleDateString();
  
  // Send email to the member
  const memberParams: EmailParams = {
    user_name: member.fullName,
    user_email: member.email,
    subject: "Welcome to Royal Fitness Gym!",
    message: `Dear ${member.fullName},\n\nWelcome to Royal Fitness Gym! Your membership has been activated and will expire on ${formattedExpiryDate} (${member.subscriptionDuration} days).\n\nThank you for choosing Royal Fitness Gym.\n\nBest regards,\nRoyal Fitness Team`,
    joining_date: joiningDate,
    expiry_date: formattedExpiryDate,
    remaining_days: member.subscriptionDuration.toString(),
    gym_name: "Royal Fitness Gym",
    sameer: "Royal Fitness Gym",
    email: "abhaysam123456@gmail.com"
  };
  
  console.log("Sending welcome email to:", member.email);
  
  // Also send notification to admin
  const adminParams: EmailParams = {
    user_name: "Admin",
    user_email: adminEmail,
    subject: "New Member Registration",
    message: `A new member has registered:\n\nName: ${member.fullName}\nEmail: ${member.email}\nSubscription Duration: ${member.subscriptionDuration} days\nExpiry Date: ${formattedExpiryDate}\nPayment Status: ${member.paymentStatus}`,
    member_name: member.fullName,
    member_email: member.email,
    subscription: `${member.subscriptionDuration} days`,
    payment: member.paymentStatus,
    expiry_date: formattedExpiryDate,
    sameer: "Royal Fitness Gym",
    email: "abhaysam123456@gmail.com"
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
  // Format joining date
  const joiningDate = new Date(member.startDate).toLocaleDateString();
  
  // Calculate expiry date
  const expiryDate = new Date(new Date(member.startDate).getTime() + (member.subscriptionDuration * 24 * 60 * 60 * 1000));
  const formattedExpiryDate = expiryDate.toLocaleDateString();
  
  // Send reminder to member
  const memberParams: EmailParams = {
    user_name: member.fullName,
    user_email: member.email,
    subject: `Royal Fitness Gym - Your membership expires in ${daysLeft} days`,
    message: `Dear ${member.fullName},\n\nThis is a friendly reminder that your Royal Fitness Gym membership will expire in ${daysLeft} days on ${formattedExpiryDate}.\n\nPlease renew your subscription to continue enjoying our services.\n\nBest regards,\nRoyal Fitness Team`,
    joining_date: joiningDate,
    expiry_date: formattedExpiryDate,
    remaining_days: daysLeft.toString(),
    gym_name: "Royal Fitness Gym",
    sameer: "Royal Fitness Gym",
    email: "abhaysam123456@gmail.com"
  };
  
  // Also notify admin about expiring membership
  const adminParams: EmailParams = {
    user_name: "Admin",
    user_email: adminEmail,
    subject: `Membership Expiring Soon - ${member.fullName}`,
    message: `A member's subscription is expiring soon:\n\nName: ${member.fullName}\nEmail: ${member.email}\nDays Left: ${daysLeft}\nExpiry Date: ${formattedExpiryDate}\nPayment Status: ${member.paymentStatus}`,
    member_name: member.fullName,
    member_email: member.email,
    days_left: daysLeft.toString(),
    expiry_date: formattedExpiryDate,
    payment: member.paymentStatus,
    sameer: "Royal Fitness Gym",
    email: "abhaysam123456@gmail.com"
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
