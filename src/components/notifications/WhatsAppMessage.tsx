
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { notificationService } from '@/services/notificationService';
import { toast } from '@/components/ui/sonner';
import { Member } from '@/types/member';
import { Loader2 } from 'lucide-react';

type WhatsAppMessageProps = {
  member?: Member;
  onClose?: () => void;
};

export const WhatsAppMessage: React.FC<WhatsAppMessageProps> = ({ member, onClose }) => {
  const [phoneNumber, setPhoneNumber] = useState(member?.phone || '');
  const [name, setName] = useState(member?.fullName || member?.full_name || '');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validatePhoneNumber = (phone: string) => {
    // Basic validation for international format
    const regex = /^[0-9]{10,15}$/;
    return regex.test(phone.replace(/[+\s-]/g, ''));
  };

  const handleSend = async () => {
    // Reset error
    setError(null);
    
    // Validate inputs
    if (!phoneNumber) {
      setError('Phone number is required');
      return;
    }
    
    if (!message) {
      setError('Message is required');
      return;
    }
    
    // Clean phone number - remove any spaces, dashes, or parentheses
    const cleanedPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    if (!validatePhoneNumber(cleanedPhone)) {
      setError('Please enter a valid phone number in international format');
      return;
    }

    setSending(true);
    try {
      const result = await notificationService.sendCustomMessage(cleanedPhone, name, message);
      if (result) {
        toast.success('Message sent successfully');
        setMessage('');
        if (onClose) onClose();
      } else {
        setError('Failed to send message. Please try again.');
        toast.error('Failed to send message');
      }
    } catch (err) {
      console.error('Error sending WhatsApp message:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(`Error: ${errorMessage}`);
      toast.error('An error occurred while sending the message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number (with country code)</Label>
        <Input 
          id="phone" 
          value={phoneNumber} 
          onChange={(e) => setPhoneNumber(e.target.value)} 
          placeholder="e.g. 919876543210"
        />
        <p className="text-xs text-muted-foreground">
          Include country code without + (e.g., 91 for India)
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="name">Member Name</Label>
        <Input 
          id="name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="Member name"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea 
          id="message" 
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
          placeholder="Enter your message here"
          className="min-h-[120px]"
        />
      </div>

      {error && (
        <div className="text-sm font-medium text-destructive">
          {error}
        </div>
      )}
      
      <Button 
        onClick={handleSend} 
        disabled={sending || !phoneNumber || !message} 
        className="w-full"
      >
        {sending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : 'Send WhatsApp Message'}
      </Button>
    </div>
  );
};
