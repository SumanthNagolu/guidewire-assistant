'use client';

import { useState } from 'react';
import { ExpenseClaim } from '@/types/hr';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { MoreHorizontal, CheckCircle, XCircle, Eye, Download, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface ExpenseClaimsTableProps {
  expenseClaims: ExpenseClaim[];
  canApprove?: boolean;
}

export default function ExpenseClaimsTable({ 
  expenseClaims, 
  canApprove = false 
}: ExpenseClaimsTableProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleApprove = async (claimId: string) => {
    setLoading(claimId);
    try {
      const { error } = await supabase
        .from('expense_claims')
        .update({ 
          status: 'Approved',
          approved_at: new Date().toISOString()
        })
        .eq('id', claimId);

      if (error) throw error;
      router.refresh();
    } catch (error) {
            alert('Failed to approve claim');
    } finally {
      setLoading(null);
    }
  };

  const openRejectDialog = (claimId: string) => {
    setSelectedClaimId(claimId);
    setRejectDialogOpen(true);
  };

  const handleReject = async () => {
    if (!selectedClaimId || !rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setLoading(selectedClaimId);
    try {
      const { error } = await supabase
        .from('expense_claims')
        .update({ 
          status: 'Rejected',
          rejection_reason: rejectionReason
        })
        .eq('id', selectedClaimId);

      if (error) throw error;

      setRejectDialogOpen(false);
      setRejectionReason('');
      setSelectedClaimId(null);
      router.refresh();
    } catch (error) {
            alert('Failed to reject claim');
    } finally {
      setLoading(null);
    }
  };

  const handleMarkAsPaid = async (claimId: string) => {
    setLoading(claimId);
    try {
      const paymentRef = `PAY-${Date.now()}`;
      const { error } = await supabase
        .from('expense_claims')
        .update({ 
          status: 'Paid',
          paid_at: new Date().toISOString(),
          payment_reference: paymentRef
        })
        .eq('id', claimId);

      if (error) throw error;
      router.refresh();
    } catch (error) {
            alert('Failed to mark as paid');
    } finally {
      setLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'Paid': 'default',
      'Approved': 'secondary',
      'Submitted': 'outline',
      'Rejected': 'destructive',
      'Draft': 'outline',
    };
    
    const colors: Record<string, string> = {
      'Paid': 'bg-blue-500',
      'Approved': 'bg-green-500',
      'Submitted': 'bg-orange-500',
      'Rejected': 'bg-red-500',
      'Draft': 'bg-gray-500',
    };
    
    return (
      <Badge variant={variants[status] || 'outline'} className={colors[status]}>
        {status}
      </Badge>
    );
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Claim #</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenseClaims.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  No expense claims found
                </TableCell>
              </TableRow>
            ) : (
              expenseClaims.map((claim) => (
                <TableRow key={claim.id}>
                  <TableCell>
                    <span className="font-mono text-sm">{claim.claim_number}</span>
                  </TableCell>
                  <TableCell>
                    {claim.employee ? (
                      <div>
                        <p className="font-medium">
                          {claim.employee.first_name} {claim.employee.last_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {claim.employee.employee_id}
                        </p>
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(claim.claim_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {claim.expense_items?.length || 0} items
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-green-600">
                      ${claim.total_amount.toLocaleString()}
                    </span>
                    <p className="text-xs text-gray-500">{claim.currency}</p>
                  </TableCell>
                  <TableCell>{getStatusBadge(claim.status)}</TableCell>
                  <TableCell>
                    <p className="max-w-xs truncate text-sm">
                      {claim.description || '-'}
                    </p>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          disabled={loading === claim.id}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/hr/expenses/claims/${claim.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Download Receipts
                        </DropdownMenuItem>
                        {canApprove && claim.status === 'Submitted' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleApprove(claim.id)}
                              className="text-green-600"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => openRejectDialog(claim.id)}
                              className="text-red-600"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </DropdownMenuItem>
                          </>
                        )}
                        {canApprove && claim.status === 'Approved' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleMarkAsPaid(claim.id)}
                              className="text-blue-600"
                            >
                              <CreditCard className="h-4 w-4 mr-2" />
                              Mark as Paid
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Rejection Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Expense Claim</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this expense claim.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false);
                setRejectionReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason.trim()}
            >
              Reject Claim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}


