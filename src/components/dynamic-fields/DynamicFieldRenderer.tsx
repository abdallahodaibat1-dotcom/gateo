'use client';

import { Check, X, Link as LinkIcon, Calendar } from 'lucide-react';
import Link from 'next/link';

export interface DynamicFieldWithValue {
  id: string;
  name: string;
  label: string;
  fieldType: string;
  options?: { value: string; label: string }[] | null;
  value?: string | null;
}

interface DynamicFieldRendererProps {
  fields?: DynamicFieldWithValue[];
  fieldValues?: { field: DynamicFieldWithValue; value: string | null }[];
  columns?: 1 | 2 | 3;
}

export function DynamicFieldRenderer({ fields, fieldValues, columns = 2 }: DynamicFieldRendererProps) {
  const normalizedFields = fields?.length
    ? fields
    : fieldValues
        ?.filter((fv) => fv.value !== null && fv.value !== undefined)
        .map((fv) => ({
          ...fv.field,
          options: Array.isArray(fv.field.options) ? fv.field.options : null,
          value: fv.value ?? undefined,
        })) || [];

  if (!normalizedFields || normalizedFields.length === 0) return null;

  const gridClass =
    columns === 3
      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      : columns === 1
      ? 'grid-cols-1'
      : 'grid-cols-1 md:grid-cols-2';

  return (
    <div className={`grid ${gridClass} gap-4`}>
      {normalizedFields.map((field) => (
        <DynamicFieldValue key={field.id} field={field} />
      ))}
    </div>
  );
}

function DynamicFieldValue({ field }: { field: DynamicFieldWithValue }) {
  const value = field.value;

  if (!value && field.fieldType !== 'BOOLEAN') {
    return null;
  }

  const label = (
    <span className="text-xs text-muted block mb-1">{field.label}</span>
  );

  switch (field.fieldType) {
    case 'BOOLEAN':
      return (
        <div className="bg-surface rounded-lg p-4 border border-border shadow-sm">
          {label}
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            {value === 'true' ? (
              <>
                <Check className="w-4 h-4 text-success" />
                نعم
              </>
            ) : (
              <>
                <X className="w-4 h-4 text-muted" />
                لا
              </>
            )}
          </div>
        </div>
      );

    case 'URL':
      return (
        <div className="bg-surface rounded-lg p-4 border border-border shadow-sm">
          {label}
          <Link
            href={value || '#'}
            target="_blank"
            rel="noopener"
            className="text-sm text-primary hover:text-primary-dark flex items-center gap-1 break-all"
          >
            <LinkIcon className="w-3.5 h-3.5 flex-shrink-0" />
            {value}
          </Link>
        </div>
      );

    case 'DATE':
      return (
        <div className="bg-surface rounded-lg p-4 border border-border shadow-sm">
          {label}
          <div className="text-sm font-medium text-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted" />
            {value}
          </div>
        </div>
      );

    case 'MULTISELECT':
      const selected = (value || '').split(',').filter(Boolean);
      const optionsMap = new Map((field.options || []).map((o) => [o.value, o.label]));
      return (
        <div className="bg-surface rounded-lg p-4 border border-border shadow-sm">
          {label}
          <div className="flex flex-wrap gap-1.5">
            {selected.map((v) => (
              <span key={v} className="text-xs bg-slate-50 text-foreground px-2 py-1 rounded-md border border-border">
                {optionsMap.get(v) || v}
              </span>
            ))}
          </div>
        </div>
      );

    case 'SELECT':
      const option = (field.options || []).find((o) => o.value === value);
      return (
        <div className="bg-surface rounded-lg p-4 border border-border shadow-sm">
          {label}
          <div className="text-sm font-medium text-foreground">{option?.label || value}</div>
        </div>
      );

    default:
      return (
        <div className="bg-surface rounded-lg p-4 border border-border shadow-sm">
          {label}
          <div className="text-sm font-medium text-foreground whitespace-pre-wrap">{value}</div>
        </div>
      );
  }
}
