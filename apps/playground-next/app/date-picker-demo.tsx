'use client';

import { DatePicker } from '@jalali-js/react';
import type { StorageValue } from 'jalali-js';
import { useState } from 'react';

export function DatePickerDemo() {
  const [stored, setStored] = useState<StorageValue | null>(null);
  return (
    <div>
      <DatePicker system="jalali" locale="en" onChange={(value) => setStored(value)} />
      <p data-testid="stored-value">Stored value: {JSON.stringify(stored)}</p>
    </div>
  );
}
