'use client';

import { useEffect, useState } from 'react';

export interface DynamicField {
  id: string;
  name: string;
  label: string;
  labelEn?: string | null;
  description?: string | null;
  fieldType: string;
  options?: { value: string; label: string }[] | null;
  placeholder?: string | null;
  isRequired: boolean;
  value?: string | null;
}

interface DynamicFieldFormProps {
  fields: DynamicField[];
  values: Record<string, string | null>;
  onChange: (values: Record<string, string | null>) => void;
  disabled?: boolean;
}

export function DynamicFieldForm({ fields, values, onChange, disabled }: DynamicFieldFormProps) {
  const handleChange = (fieldId: string, value: string | null) => {
    onChange({ ...values, [fieldId]: value });
  };

  if (fields.length === 0) return null;

  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <DynamicFieldInput
          key={field.id}
          field={field}
          value={values[field.id] || null}
          onChange={(value) => handleChange(field.id, value)}
          disabled={disabled}
        />
      ))}
    </div>
  );
}

interface DynamicFieldInputProps {
  field: DynamicField;
  value: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
}

function DynamicFieldInput({ field, value, onChange, disabled }: DynamicFieldInputProps) {
  const fieldId = `field-${field.id}`;
  const baseClass =
    'w-full px-4 py-2.5 rounded-md border bg-surface border-border text-sm text-foreground placeholder:text-slate-400 transition-colors disabled:bg-slate-100 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none';

  switch (field.fieldType) {
    case 'TEXT':
      return (
        <div>
          <label htmlFor={fieldId} className="block text-sm font-medium text-foreground mb-1">
            {field.label}
            {field.isRequired && <span className="text-danger mr-1">*</span>}
          </label>
          {field.description && <p className="text-xs text-muted mb-1">{field.description}</p>}
          <input
            id={fieldId}
            type="text"
            value={value || ''}
            placeholder={field.placeholder || ''}
            onChange={(e) => onChange(e.target.value || null)}
            disabled={disabled}
            required={field.isRequired}
            className={baseClass}
          />
        </div>
      );

    case 'TEXTAREA':
      return (
        <div>
          <label htmlFor={fieldId} className="block text-sm font-medium text-foreground mb-1">
            {field.label}
            {field.isRequired && <span className="text-danger mr-1">*</span>}
          </label>
          {field.description && <p className="text-xs text-muted mb-1">{field.description}</p>}
          <textarea
            id={fieldId}
            value={value || ''}
            placeholder={field.placeholder || ''}
            onChange={(e) => onChange(e.target.value || null)}
            disabled={disabled}
            required={field.isRequired}
            rows={4}
            className={baseClass}
          />
        </div>
      );

    case 'NUMBER':
      return (
        <div>
          <label htmlFor={fieldId} className="block text-sm font-medium text-foreground mb-1">
            {field.label}
            {field.isRequired && <span className="text-danger mr-1">*</span>}
          </label>
          {field.description && <p className="text-xs text-muted mb-1">{field.description}</p>}
          <input
            id={fieldId}
            type="number"
            value={value || ''}
            placeholder={field.placeholder || ''}
            onChange={(e) => onChange(e.target.value || null)}
            disabled={disabled}
            required={field.isRequired}
            className={`${baseClass} dir-ltr`}
          />
        </div>
      );

    case 'URL':
      return (
        <div>
          <label htmlFor={fieldId} className="block text-sm font-medium text-foreground mb-1">
            {field.label}
            {field.isRequired && <span className="text-danger mr-1">*</span>}
          </label>
          {field.description && <p className="text-xs text-muted mb-1">{field.description}</p>}
          <input
            id={fieldId}
            type="url"
            value={value || ''}
            placeholder={field.placeholder || 'https://...'}
            onChange={(e) => onChange(e.target.value || null)}
            disabled={disabled}
            required={field.isRequired}
            className={`${baseClass} dir-ltr`}
          />
        </div>
      );

    case 'DATE':
      return (
        <div>
          <label htmlFor={fieldId} className="block text-sm font-medium text-foreground mb-1">
            {field.label}
            {field.isRequired && <span className="text-danger mr-1">*</span>}
          </label>
          {field.description && <p className="text-xs text-muted mb-1">{field.description}</p>}
          <input
            id={fieldId}
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value || null)}
            disabled={disabled}
            required={field.isRequired}
            className={`${baseClass} dir-ltr`}
          />
        </div>
      );

    case 'BOOLEAN':
      return (
        <div className="flex items-center gap-3 p-3 rounded-md border border-border bg-slate-50/50">
          <input
            id={fieldId}
            type="checkbox"
            checked={value === 'true'}
            onChange={(e) => onChange(e.target.checked ? 'true' : 'false')}
            disabled={disabled}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
          />
          <label htmlFor={fieldId} className="text-sm text-foreground cursor-pointer flex-1">
            {field.label}
            {field.isRequired && <span className="text-danger mr-1">*</span>}
          </label>
        </div>
      );

    case 'SELECT':
      return (
        <div>
          <label htmlFor={fieldId} className="block text-sm font-medium text-foreground mb-1">
            {field.label}
            {field.isRequired && <span className="text-danger mr-1">*</span>}
          </label>
          {field.description && <p className="text-xs text-muted mb-1">{field.description}</p>}
          <select
            id={fieldId}
            value={value || ''}
            onChange={(e) => onChange(e.target.value || null)}
            disabled={disabled}
            required={field.isRequired}
            className={baseClass}
          >
            <option value="">اختر...</option>
            {(field.options || []).map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      );

    case 'MULTISELECT':
      return (
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            {field.label}
            {field.isRequired && <span className="text-danger mr-1">*</span>}
          </label>
          {field.description && <p className="text-xs text-muted mb-1">{field.description}</p>}
          <div className="flex flex-wrap gap-2 p-3 rounded-md border border-border bg-slate-50/50">
            {(field.options || []).map((opt) => {
              const selected = (value || '').split(',').filter(Boolean).includes(opt.value);
              return (
                <label
                  key={opt.value}
                  className={`px-3 py-1.5 rounded-md text-sm cursor-pointer transition-colors ${
                    selected
                      ? 'bg-primary text-white'
                      : 'bg-surface text-foreground border border-border hover:border-primary/30'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={selected}
                    disabled={disabled}
                    onChange={(e) => {
                      const current = (value || '').split(',').filter(Boolean);
                      const updated = e.target.checked
                        ? [...current, opt.value]
                        : current.filter((v) => v !== opt.value);
                      onChange(updated.join(',') || null);
                    }}
                  />
                  {opt.label}
                </label>
              );
            })}
          </div>
        </div>
      );

    default:
      return (
        <div>
          <label htmlFor={fieldId} className="block text-sm font-medium text-foreground mb-1">
            {field.label}
          </label>
          <input
            id={fieldId}
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value || null)}
            disabled={disabled}
            className={baseClass}
          />
        </div>
      );
  }
}
