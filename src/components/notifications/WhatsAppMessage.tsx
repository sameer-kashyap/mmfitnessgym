
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { notificationService } from '@/services/notificationService';
import { toast } from '@/components/ui/sonner';
import { Member } from '@/types/member';

type WhatsAppMessageProps = {
  member?: Member;
  onClose?: () => void;
};

export const WhatsAppMessage: React.FC<WhatsAppMessageProps> = ({ member, onClose }) => {
  const [phoneNumber, setPhoneNumber] = useState(member?.phone || '');
  const [name, setName] = useState(member?.fullName || member?.full_name || '');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!phoneNumber || !message) {
      toast.error('Phone number and message are required');
      return;
    }

    setSending(true);
    try {
      const result = await notificationService.sendCustomMessage(phoneNumber, name, message);
      if (result) {
        toast.success('Message sent successfully');
        setMessage('');
        if (onClose) onClose();
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
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
      
      <Button 
        onClick={handleSend} 
        disabled={sending || !phoneNumber || !message} 
        className="w-full"
      >
        {sending ? 'Sending...' : 'Send WhatsApp Message'}
      </Button>
    </div>
  );
};
