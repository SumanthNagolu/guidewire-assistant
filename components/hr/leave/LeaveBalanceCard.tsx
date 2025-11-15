'use client';

import { LeaveBalance } from '@/types/hr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface LeaveBalanceCardProps {
  balance: LeaveBalance;
}

export default function LeaveBalanceCard({ balance }: LeaveBalanceCardProps) {
  const usagePercentage = (balance.used_days / balance.entitled_days) * 100;
  const availablePercentage = (balance.balance_days / balance.entitled_days) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{balance.leave_type?.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Available Balance */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Available</span>
            <span className="text-2xl font-bold text-green-600">
              {balance.balance_days}
            </span>
          </div>
          <Progress value={availablePercentage} className="h-2" />
        </div>

        {/* Details */}
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div>
            <p className="text-gray-500">Entitled</p>
            <p className="font-semibold">{balance.entitled_days}</p>
          </div>
          <div>
            <p className="text-gray-500">Used</p>
            <p className="font-semibold text-orange-600">{balance.used_days}</p>
          </div>
          <div>
            <p className="text-gray-500">Pending</p>
            <p className="font-semibold text-blue-600">{balance.pending_days}</p>
          </div>
        </div>

        {/* Year */}
        <p className="text-xs text-gray-400">Year {balance.year}</p>
      </CardContent>
    </Card>
  );
}


