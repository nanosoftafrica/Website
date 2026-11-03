"use client";

import { useState, FormEvent } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface FieldMetadata {
  id: string;
  name: string;
  label: string;
  type: "text" | "long_text" | "email" | "phone" | "number" | "currency" | "boolean" | "date" | "datetime" | "select" | "multi_select" | "relation";
  required?: boolean;
  unique_constraint?: boolean;
  default_value?: string | null;
  placeholder?: string;
  help_text?: string;
  config?: Record<string, any>;
  display_order?: number;
  hidden?: boolean;
}

export interface DynamicFormProps {
  title: string;
  subtitle?: string;
  fields: FieldMetadata[];
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  submitLabel?: string;
  isLoading?: boolean;
  error?: string;
}

export default function DynamicForm({
  title,
  subtitle,
  fields,
  initialData = {},
  onSubmit,
  submitLabel = "Save",
  isLoading = false,
  error,
}: DynamicFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [localError, setLocalError] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Sort fields by display_order
  const sortedFields = [...fields]
    .filter((f) => !f.hidden)
    .sort((a, b) => (a.display_order || 999) - (b.display_order || 999));

  function handleChange(name: string, value: any) {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  function validateForm(): boolean {
    const errors: Record<string, string> = {};

    sortedFields.forEach((field) => {
      const value = formData[field.name];

      // Check required
      if (field.required && (value === null || value === undefined || value === "")) {
        errors[field.name] = `${field.label} is required`;
        return;
      }

      // Check email format
      if (field.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
        errors[field.name] = "Invalid email format";
        return;
      }

      // Check phone format (basic)
      if (field.type === "phone" && value && !/^\+?[\d\s\-()]+$/.test(String(value))) {
        errors[field.name] = "Invalid phone format";
        return;
      }

      // Check number type
      if (field.type === "number" && value && isNaN(Number(value))) {
        errors[field.name] = "Must be a number";
        return;
      }

      // Check currency type
      if (field.type === "currency" && value && isNaN(Number(value))) {
        errors[field.name] = "Must be a number";
        return;
      }
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return false;
    }

    return true;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLocalError("");

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err) {
      setLocalError((err as Error).message);
    }
  }

  function renderField(field: FieldMetadata) {
    const value = formData[field.name] ?? "";
    const hasError = fieldErrors[field.name];

    const fieldClass = hasError ? "adm-field adm-field-error" : "adm-field";

    switch (field.type) {
      case "text":
        return (
          <div key={field.id} className={fieldClass}>
            <label>
              {field.label}
              {field.required && <span className="adm-required">*</span>}
            </label>
            <input
              type="text"
              placeholder={field.placeholder || ""}
              value={String(value)}
              onChange={(e) => handleChange(field.name, e.target.value)}
              disabled={isLoading}
            />
            {hasError && <p className="adm-field-error-text">{hasError}</p>}
            {field.help_text && <p className="adm-field-help">{field.help_text}</p>}
          </div>
        );

      case "long_text":
        return (
          <div key={field.id} className={fieldClass}>
            <label>
              {field.label}
              {field.required && <span className="adm-required">*</span>}
            </label>
            <textarea
              placeholder={field.placeholder || ""}
              value={String(value)}
              onChange={(e) => handleChange(field.name, e.target.value)}
              disabled={isLoading}
              rows={4}
            />
            {hasError && <p className="adm-field-error-text">{hasError}</p>}
            {field.help_text && <p className="adm-field-help">{field.help_text}</p>}
          </div>
        );

      case "email":
        return (
          <div key={field.id} className={fieldClass}>
            <label>
              {field.label}
              {field.required && <span className="adm-required">*</span>}
            </label>
            <input
              type="email"
              placeholder={field.placeholder || ""}
              value={String(value)}
              onChange={(e) => handleChange(field.name, e.target.value)}
              disabled={isLoading}
            />
            {hasError && <p className="adm-field-error-text">{hasError}</p>}
            {field.help_text && <p className="adm-field-help">{field.help_text}</p>}
          </div>
        );

      case "phone":
        return (
          <div key={field.id} className={fieldClass}>
            <label>
              {field.label}
              {field.required && <span className="adm-required">*</span>}
            </label>
            <input
              type="tel"
              placeholder={field.placeholder || ""}
              value={String(value)}
              onChange={(e) => handleChange(field.name, e.target.value)}
              disabled={isLoading}
            />
            {hasError && <p className="adm-field-error-text">{hasError}</p>}
            {field.help_text && <p className="adm-field-help">{field.help_text}</p>}
          </div>
        );

      case "number":
        return (
          <div key={field.id} className={fieldClass}>
            <label>
              {field.label}
              {field.required && <span className="adm-required">*</span>}
            </label>
            <input
              type="number"
              placeholder={field.placeholder || ""}
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value ? Number(e.target.value) : "")}
              disabled={isLoading}
            />
            {hasError && <p className="adm-field-error-text">{hasError}</p>}
            {field.help_text && <p className="adm-field-help">{field.help_text}</p>}
          </div>
        );

      case "currency":
        const currency = field.config?.currency || "KES";
        return (
          <div key={field.id} className={fieldClass}>
            <label>
              {field.label}
              {field.required && <span className="adm-required">*</span>}
            </label>
            <div className="adm-input-group">
              <span className="adm-input-addon">{currency}</span>
              <input
                type="number"
                placeholder={field.placeholder || "0.00"}
                value={value}
                onChange={(e) => handleChange(field.name, e.target.value ? Number(e.target.value) : "")}
                disabled={isLoading}
                step="0.01"
              />
            </div>
            {hasError && <p className="adm-field-error-text">{hasError}</p>}
            {field.help_text && <p className="adm-field-help">{field.help_text}</p>}
          </div>
        );

      case "boolean":
        return (
          <div key={field.id} className={fieldClass}>
            <label className="adm-checkbox-label">
              <input
                type="checkbox"
                checked={!!value}
                onChange={(e) => handleChange(field.name, e.target.checked)}
                disabled={isLoading}
              />
              <span>{field.label}</span>
            </label>
            {hasError && <p className="adm-field-error-text">{hasError}</p>}
            {field.help_text && <p className="adm-field-help">{field.help_text}</p>}
          </div>
        );

      case "date":
        return (
          <div key={field.id} className={fieldClass}>
            <label>
              {field.label}
              {field.required && <span className="adm-required">*</span>}
            </label>
            <input
              type="date"
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
              disabled={isLoading}
            />
            {hasError && <p className="adm-field-error-text">{hasError}</p>}
            {field.help_text && <p className="adm-field-help">{field.help_text}</p>}
          </div>
        );

      case "datetime":
        return (
          <div key={field.id} className={fieldClass}>
            <label>
              {field.label}
              {field.required && <span className="adm-required">*</span>}
            </label>
            <input
              type="datetime-local"
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
              disabled={isLoading}
            />
            {hasError && <p className="adm-field-error-text">{hasError}</p>}
            {field.help_text && <p className="adm-field-help">{field.help_text}</p>}
          </div>
        );

      case "select":
        const options = field.config?.options || [];
        return (
          <div key={field.id} className={fieldClass}>
            <label>
              {field.label}
              {field.required && <span className="adm-required">*</span>}
            </label>
            <select
              value={String(value)}
              onChange={(e) => handleChange(field.name, e.target.value)}
              disabled={isLoading}
            >
              <option value="">— Select —</option>
              {options.map((opt: any) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {hasError && <p className="adm-field-error-text">{hasError}</p>}
            {field.help_text && <p className="adm-field-help">{field.help_text}</p>}
          </div>
        );

      case "multi_select":
        const multiOptions = field.config?.options || [];
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div key={field.id} className={fieldClass}>
            <label>
              {field.label}
              {field.required && <span className="adm-required">*</span>}
            </label>
            <div className="adm-multi-select">
              {multiOptions.map((opt: any) => (
                <label key={opt.value} className="adm-checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(opt.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleChange(field.name, [...selectedValues, opt.value]);
                      } else {
                        handleChange(
                          field.name,
                          selectedValues.filter((v: string) => v !== opt.value)
                        );
                      }
                    }}
                    disabled={isLoading}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
            {hasError && <p className="adm-field-error-text">{hasError}</p>}
            {field.help_text && <p className="adm-field-help">{field.help_text}</p>}
          </div>
        );

      default:
        return (
          <div key={field.id} className={fieldClass}>
            <label>{field.label}</label>
            <p style={{ color: "#999" }}>Field type "{field.type}" not supported yet</p>
          </div>
        );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="adm-form">
      <div className="adm-form-header">
        <h2 className="adm-h2">{title}</h2>
        {subtitle && <p className="adm-sub">{subtitle}</p>}
      </div>

      {error && <div className="adm-error-box">{error}</div>}
      {localError && <div className="adm-error-box">{localError}</div>}

      <div className="adm-form-body">
        {sortedFields.length === 0 ? (
          <p style={{ color: "#999" }}>No fields available</p>
        ) : (
          sortedFields.map((field) => renderField(field))
        )}
      </div>

      <div className="adm-form-footer">
        <button type="submit" className="adm-btn adm-btn-primary" disabled={isLoading}>
          {isLoading ? "Saving…" : submitLabel}
        </button>
      </div>

      <style>{`
        .adm-form {
          max-width: 600px;
        }

        .adm-form-header {
          margin-bottom: 24px;
        }

        .adm-form-body {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 24px;
        }

        .adm-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .adm-field label {
          font-weight: 600;
          font-size: 14px;
          color: #333;
        }

        .adm-required {
          color: #ef4444;
          margin-left: 2px;
        }

        .adm-field input,
        .adm-field textarea,
        .adm-field select {
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          padding: 10px 12px;
          font-size: 14px;
          font-family: inherit;
          transition: border-color 0.15s ease;
        }

        .adm-field input:focus,
        .adm-field textarea:focus,
        .adm-field select:focus {
          outline: none;
          border-color: #0096d6;
          box-shadow: 0 0 0 3px rgba(0, 150, 214, 0.1);
        }

        .adm-field input:disabled,
        .adm-field textarea:disabled,
        .adm-field select:disabled {
          background-color: #f8f8f8;
          color: #999;
          cursor: not-allowed;
        }

        .adm-field-error {
          gap: 8px;
        }

        .adm-field-error input,
        .adm-field-error textarea,
        .adm-field-error select {
          border-color: #ef4444;
          background-color: rgba(239, 68, 68, 0.02);
        }

        .adm-field-error-text {
          font-size: 12px;
          color: #ef4444;
          margin: 0;
        }

        .adm-field-help {
          font-size: 12px;
          color: #999;
          margin: 0;
        }

        .adm-checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-weight: normal;
        }

        .adm-checkbox-label input {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .adm-input-group {
          display: flex;
          align-items: center;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          overflow: hidden;
        }

        .adm-input-addon {
          padding: 10px 12px;
          background-color: #f8f8f8;
          font-size: 13px;
          font-weight: 600;
          color: #666;
          border-right: 1px solid #e0e0e0;
        }

        .adm-input-group input {
          flex: 1;
          border: none;
          margin: 0;
          border-radius: 0;
        }

        .adm-multi-select {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 8px;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          background-color: #fafafa;
        }

        .adm-error-box {
          background-color: rgba(239, 68, 68, 0.1);
          border: 1px solid #ef4444;
          border-radius: 6px;
          padding: 12px;
          font-size: 14px;
          color: #991b1b;
          margin-bottom: 16px;
        }

        .adm-form-footer {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }
      `}</style>
    </form>
  );
}

/* eslint-enable @typescript-eslint/no-explicit-any */
