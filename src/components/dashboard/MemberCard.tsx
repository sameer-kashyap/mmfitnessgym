
import React, { useState } from "react";
import { Member } from "../../types/member";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { calculateDaysLeft, formatDate, getMemberStatus } from "../../lib/utils";
import { useMembers } from "../../context/MemberContext";
import { Calendar, Phone, Trash2, Edit, Save, X } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../ui/select";

interface MemberCardProps {
  member: Member;
}

const MemberCard: React.FC<MemberCardProps> = ({ member }) => {
  const { removeMember, updateMember } = useMembers();
  const daysLeft = calculateDaysLeft(member.startDate, member.subscriptionDuration);
  const status = getMemberStatus(member);
  const expiryDate = new Date(new Date(member.startDate).getTime() + member.subscriptionDuration * 24 * 60 * 60 * 1000);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    phone: member.phone,
    subscriptionDuration: member.subscriptionDuration.toString(),
    paymentStatus: member.paymentStatus,
    resetStartDate: false
  });

  let statusLabel = "";
  let statusClass = "";
  
  switch (status) {
    case "active":
      statusLabel = "Active";
      statusClass = "status-active";
      break;
    case "expiring-soon":
      statusLabel = `Expiring in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`;
      statusClass = "status-expiring";
      break;
    case "grace-period":
      statusLabel = "Grace Period";
      statusClass = "status-expired";
      break;
    case "expired":
      statusLabel = "Expired";
      statusClass = "status-expired";
      break;
  }

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const updates: Partial<Member> = {
      phone: editData.phone,
      subscriptionDuration: parseInt(editData.subscriptionDuration),
      paymentStatus: editData.paymentStatus as 'paid' | 'unpaid'
    };

    // If resetting start date, update that too
    if (editData.resetStartDate) {
      updates.startDate = new Date().toISOString();
      // Reset reminder flags when renewing
      updates.reminderSent = {
        sevenDays: false,
        threeDays: false,
        oneDay: false
      };
    }

    updateMember(member.id, updates);
    setIsEditing(false);
  };
  
  return (
    <Card className="gym-card h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold">{member.fullName}</CardTitle>
          {!isEditing && (
            <span className={`status-badge ${statusClass}`}>
              {statusLabel}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pb-2">
        {!isEditing ? (
          <>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{member.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Expires: {formatDate(expiryDate.toISOString())}</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className={`status-badge ${member.paymentStatus === 'paid' ? 'status-active' : 'status-unpaid'}`}>
                {member.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
              </span>
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="phone" className="text-xs">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                value={editData.phone}
                onChange={handleEditChange}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="subscriptionDuration" className="text-xs">Subscription (Days)</Label>
              <Input
                id="subscriptionDuration"
                name="subscriptionDuration"
                type="number"
                min="1"
                max="365"
                value={editData.subscriptionDuration}
                onChange={handleEditChange}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="paymentStatus" className="text-xs">Payment Status</Label>
              <Select 
                value={editData.paymentStatus}
                onValueChange={(value) => handleSelectChange('paymentStatus', value)}
              >
                <SelectTrigger id="paymentStatus" className="h-8 text-sm">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="resetStartDate" 
                name="resetStartDate"
                checked={editData.resetStartDate}
                onChange={handleEditChange}
                className="h-4 w-4"
              />
              <Label htmlFor="resetStartDate" className="text-xs">Reset start date to today</Label>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2">
        {!isEditing ? (
          <div className="flex w-full gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1" 
              onClick={() => setIsEditing(true)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              className="flex-1" 
              onClick={() => removeMember(member.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove
            </Button>
          </div>
        ) : (
          <div className="flex w-full gap-2">
            <Button 
              variant="default" 
              size="sm" 
              className="flex-1 bg-royal-purple hover:bg-royal-light" 
              onClick={handleSave}
            >
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1" 
              onClick={() => setIsEditing(false)}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default MemberCard;
