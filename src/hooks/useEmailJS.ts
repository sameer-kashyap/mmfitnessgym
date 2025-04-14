
import { useState, useEffect } from 'react';
import { toast } from "../components/ui/sonner";

export function useEmailJS() {
  const [emailJSLoaded, setEmailJSLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js";
    script.async = true;
    script.onload = () => {
      console.log("EmailJS script loaded");
      window.emailjs.init("H-8V_wOp5vS_BD8gO");
      setEmailJSLoaded(true);
    };
    script.onerror = () => {
      console.error("Failed to load EmailJS");
      toast.error("Failed to load email service");
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return emailJSLoaded;
}
