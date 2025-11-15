'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function EmployeeEditForm({ employeeId }: { employeeId: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Employee</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Employee editor for ID: {employeeId}</p>
        <Button className="mt-4">Save Changes</Button>
      </CardContent>
    </Card>
  );
}

