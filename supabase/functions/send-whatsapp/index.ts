
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { memberName, phoneNumber, messageType, expiryDate, message } = await req.json();
    
    // In a real implementation, you would use a WhatsApp Business API provider here
    // For example: Twilio, MessageBird, etc.
    
    // For demonstration, we'll log what would be sent
    console.log(`Would send WhatsApp message to ${phoneNumber} about ${memberName}`);
    
    let messageContent = "";
    
    if (message) {
      // If a custom message is provided, use that
      messageContent = message;
    } else if (messageType === 'new-member') {
      messageContent = `Welcome to MM Fitness, ${memberName}! Your membership has been successfully added.`;
    } else if (messageType === 'expiry') {
      messageContent = `Dear ${memberName}, your MM Fitness membership is expiring on ${expiryDate}. Please renew to continue enjoying our services.`;
    }
    
    console.log(`Message content: ${messageContent}`);
    
    // Get API tokens from environment variables
    const ultramsgToken = Deno.env.get("ULTRAMSG_TOKEN");
    const ultramsgInstanceId = Deno.env.get("ULTRAMSG_INSTANCE_ID");
    
    // Log that we would send the message (for demo purposes)
    console.log("UltraMsg credentials available:", !!ultramsgToken && !!ultramsgInstanceId);
    
    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Notification queued for sending" 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("WhatsApp notification error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});
