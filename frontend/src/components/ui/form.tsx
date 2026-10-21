'use client';

import * as React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Field = ({ label, name, field, ...props }: { label?: string; name: string; field: any; type?: string }) => (
  <div className="mb-4">
    {label && <Label htmlFor={name}>{label}</Label>}
    <Input id={name} {...field} {...props} />
  </div>
);

export { Field, Label, Input, Select, SelectItem, SelectTrigger, SelectValue };
