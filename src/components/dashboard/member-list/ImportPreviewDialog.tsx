
import React from "react";
import { X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

interface ImportPreviewDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  importedMembers: any[];
  importErrors: string[];
  onConfirmImport: () => void;
}

export const ImportPreviewDialog = ({
  isOpen,
  setIsOpen,
  importedMembers,
  importErrors,
  onConfirmImport,
}: ImportPreviewDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Members Preview</DialogTitle>
        </DialogHeader>
        
        {importErrors.length > 0 && (
          <div className="bg-red-50 p-3 rounded-md mb-4">
            <h4 className="text-red-600 font-medium mb-1">Errors in CSV File:</h4>
            <ul className="text-red-600 text-sm list-disc list-inside">
              {importErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Full Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Joining Date</TableHead>
                <TableHead>Subscription (Days)</TableHead>
                <TableHead>Payment Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {importedMembers.map((member, index) => (
                <TableRow key={index}>
                  <TableCell>{member.fullName}</TableCell>
                  <TableCell>{member.phone}</TableCell>
                  <TableCell>{new Date(member.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{member.subscriptionDuration}</TableCell>
                  <TableCell>{member.paymentStatus}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <DialogFooter className="sm:justify-between">
          <div className="text-sm text-muted-foreground">
            {importedMembers.length} members ready to import
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button 
              onClick={onConfirmImport}
              disabled={importedMembers.length === 0}
              className="bg-royal-purple hover:bg-royal-light"
            >
              <Upload className="mr-2 h-4 w-4" />
              Confirm Import
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
