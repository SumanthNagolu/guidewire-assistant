'use client';

import { useState } from 'react';
import { Timesheet } from '@/types/hr';
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
import { MoreHorizontal, CheckCircle, XCircle, Eye, Edit } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface TimesheetTableProps {
  timesheets: Timesheet[];
  canApprove?: boolean;
}

export default function TimesheetTable({ timesheets, canApprove = false }: TimesheetTableProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleApprove = async (timesheetId: string) => {
    setLoading(timesheetId);
    try {
      const { error } = await supabase
        .from('timesheets')
        .update({ 
          status: 'Approved',
          approved_at: new Date().toISOString()
        })
        .eq('id', timesheetId);

      if (error) throw error;
      router.refresh();
    } catch (error) {
          } finally {
      setLoading(null);
    }
  };

  const handleReject = async (timesheetId: string) => {
    setLoading(timesheetId);
    try {
      const reason = prompt('Please provide a reason for rejection:');
      if (!reason) return;

      const { error } = await supabase
        .from('timesheets')
        .update({ 
          status: 'Rejected',
          rejection_reason: reason
        })
        .eq('id', timesheetId);

      if (error) throw error;
      router.refresh();
    } catch (error) {
          } finally {
      setLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'Approved': 'default',
      'Submitted': 'secondary',
      'Rejected': 'destructive',
      'Draft': 'outline',
    };
    
    return (
      <Badge variant={variants[status] || 'outline'}>
        {status}
      </Badge>
    );
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '-';
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Employee</TableHead>
            <TableHead>Clock In</TableHead>
            <TableHead>Clock Out</TableHead>
            <TableHead>Break</TableHead>
            <TableHead>Total Hours</TableHead>
            <TableHead>Overtime</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {timesheets.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                No timesheets found
              </TableCell>
            </TableRow>
          ) : (
            timesheets.map((timesheet) => (
              <TableRow key={timesheet.id}>
                <TableCell>
                  {new Date(timesheet.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </TableCell>
                <TableCell>
                  {timesheet.employee ? (
                    <div>
                      <p className="font-medium">
                        {timesheet.employee.first_name} {timesheet.employee.last_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {timesheet.employee.employee_id}
                      </p>
                    </div>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>{formatTime(timesheet.clock_in)}</TableCell>
                <TableCell>{formatTime(timesheet.clock_out)}</TableCell>
                <TableCell>{timesheet.break_duration}m</TableCell>
                <TableCell>
                  <span className="font-semibold">
                    {timesheet.total_hours?.toFixed(2) || '0.00'}h
                  </span>
                </TableCell>
                <TableCell>
                  {timesheet.overtime_hours && timesheet.overtime_hours > 0 ? (
                    <span className="text-purple-600 font-semibold">
                      {timesheet.overtime_hours.toFixed(2)}h
                    </span>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>{getStatusBadge(timesheet.status)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={loading === timesheet.id}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/hr/timesheets/${timesheet.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      {timesheet.status === 'Draft' && (
                        <DropdownMenuItem asChild>
                          <Link href={`/hr/timesheets/${timesheet.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                      )}
                      {canApprove && timesheet.status === 'Submitted' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleApprove(timesheet.id)}
                            className="text-green-600"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleReject(timesheet.id)}
                            className="text-red-600"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
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
  );
}


