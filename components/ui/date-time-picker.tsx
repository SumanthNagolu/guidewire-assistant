'use client';

import React from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';

interface DateTimePickerProps {
  value: Date | null | undefined;
  onChange: (date: Date | null) => void;
  placeholder?: string;
}

export function DateTimePicker({ value, onChange, placeholder = 'Select date and time' }: DateTimePickerProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    onChange(dateValue ? new Date(dateValue) : null);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start text-left font-normal">
          <Calendar className="mr-2 h-4 w-4" />
          {value ? format(value, 'PPP p') : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3">
        <Input
          type="datetime-local"
          value={value ? format(value, "yyyy-MM-dd'T'HH:mm") : ''}
          onChange={handleInputChange}
          className="w-full"
        />
      </PopoverContent>
    </Popover>
  );
}


