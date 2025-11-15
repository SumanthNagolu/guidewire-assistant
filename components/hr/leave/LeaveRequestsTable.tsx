'use client';

import { useState } from 'react';
import { LeaveRequest } from '@/types/hr';
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
import { MoreHorizontal, CheckCircle, XCircle, Eye, Trash } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface LeaveRequestsTableProps {
  leaveRequests: LeaveRequest[];
  canApprove?: boolean;
}

export default function LeaveRequestsTable({ 
  leaveRequests, 
  canApprove = false 
}: LeaveRequestsTableProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleApprove = async (requestId: string) => {
    setLoading(requestId);
    try {
      const request = leaveRequests.find(r => r.id === requestId);
      if (!request) return;

      const { error } = await supabase
        .from('leave_requests')
        .update({ 
          status: 'Approved',
          approved_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      // Update leave balance
      const currentYear = new Date().getFullYear();
      const { error: balanceError } = await supabase.rpc('update_leave_balance', {
        emp_id: request.employee_id,
        leave_type: request.leave_type_id,
        yr: currentYear,
        days_to_deduct: request.total_days,
      });

      if (balanceError) 
      router.refresh();
    } catch (error) {
            alert('Failed to approve request');
    } finally {
      setLoading(null);
    }
  };

  const openRejectDialog = (requestId: string) => {
    setSelectedRequestId(requestId);
    setRejectDialogOpen(true);
  };

  const handleReject = async () => {
    if (!selectedRequestId || !rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setLoading(selectedRequestId);
    try {
      const { error } = await supabase
        .from('leave_requests')
        .update({ 
          status: 'Rejected',
          rejection_reason: rejectionReason
        })
        .eq('id', selectedRequestId);

      if (error) throw error;

      setRejectDialogOpen(false);
      setRejectionReason('');
      setSelectedRequestId(null);
      router.refresh();
    } catch (error) {
            alert('Failed to reject request');
    } finally {
      setLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'Approved': 'default',
      'Pending': 'secondary',
      'Rejected': 'destructive',
      'Cancelled': 'outline',
    };
    
    const colors: Record<string, string> = {
      'Approved': 'bg-green-500',
      'Pending': 'bg-orange-500',
      'Rejected': 'bg-red-500',
      'Cancelled': 'bg-gray-500',
    };
    
    return (
      <Badge variant={variants[status] || 'outline'} className={colors[status]}>
        {status}
      </Badge>
    );
  };

  const calculateDuration = (fromDate: string, toDate: string) => {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const diffTime = Math.abs(to.getTime() - from.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Leave Type</TableHead>
              <TableHead>From Date</TableHead>
              <TableHead>To Date</TableHead>
              <TableHead>Days</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Applied On</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaveRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                  No leave requests found
                </TableCell>
              </TableRow>
            ) : (
              leaveRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    {request.employee ? (
                      <div>
                        <p className="font-medium">
                          {request.employee.first_name} {request.employee.last_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {request.employee.employee_id}
                        </p>
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {request.leave_type?.name || 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(request.from_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>
                    {new Date(request.to_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">{request.total_days}</span> days
                  </TableCell>
                  <TableCell>
                    <p className="max-w-xs truncate text-sm">
                      {request.reason || '-'}
                    </p>
                  </TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(request.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          disabled={loading === request.id}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/hr/leave/requests/${request.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        {canApprove && request.status === 'Pending' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleApprove(request.id)}
                              className="text-green-600"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => openRejectDialog(request.id)}
                              className="text-red-600"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </DropdownMenuItem>
                          </>
                        )}
                        {request.status === 'Pending' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash className="h-4 w-4 mr-2" />
                              Cancel Request
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
            <DialogTitle>Reject Leave Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this leave request.
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
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}


