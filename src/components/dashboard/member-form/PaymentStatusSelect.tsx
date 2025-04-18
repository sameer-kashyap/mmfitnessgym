
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface PaymentStatusSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export const PaymentStatusSelect = ({ value, onChange }: PaymentStatusSelectProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="paymentStatus">Payment Status</Label>
      <Select 
        value={value}
        onValueChange={(value) => onChange(value)}
      >
        <SelectTrigger id="paymentStatus">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="paid">Paid</SelectItem>
          <SelectItem value="unpaid">Unpaid</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
