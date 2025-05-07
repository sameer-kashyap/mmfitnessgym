
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
    
    // Build the message content based on the type or use custom message
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
    console.log(`Sending to phone number: ${phoneNumber}`);
    
    // Format the phone number (remove leading + if present)
    const formattedPhone = phoneNumber.replace(/^\+/, "");
    
    // Send the message using the Baileys API endpoint
    const response = await fetch("https://baileys-bot-production.up.railway.app/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        phone: formattedPhone,
        message: messageContent
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to send WhatsApp message: ${errorData}`);
    }
    
    const result = await response.json();
    
    // Return success response with the API result
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "WhatsApp message sent successfully",
        result
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
