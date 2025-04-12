
interface Window {
  emailjs: {
    init: (publicKey: string) => void;
    send: (
      serviceId: string, 
      templateId: string, 
      templateParams: Record<string, unknown>, 
      publicKey: string
    ) => Promise<{ status: number; text: string }>;
  }
}
