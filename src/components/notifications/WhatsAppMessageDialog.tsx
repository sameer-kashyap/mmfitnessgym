
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { WhatsAppMessage } from './WhatsAppMessage';
import { Member } from '@/types/member';
import { MessageSquare } from 'lucide-react';

type WhatsAppMessageDialogProps = {
  member?: Member;
  buttonText?: string;
  showIcon?: boolean;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
};

export const WhatsAppMessageDialog: React.FC<WhatsAppMessageDialogProps> = ({ 
  member, 
  buttonText = "Send WhatsApp", 
  showIcon = true,
  variant = "default",
  size = "default",
  className
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          {showIcon && <MessageSquare className="h-4 w-4 mr-2" />}
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send WhatsApp Message</DialogTitle>
          <DialogDescription>
            Send a WhatsApp message to the member using the gym's business account.
          </DialogDescription>
        </DialogHeader>
        <WhatsAppMessage 
          member={member} 
          onClose={() => setOpen(false)} 
        />
      </DialogContent>
    </Dialog>
  );
};
