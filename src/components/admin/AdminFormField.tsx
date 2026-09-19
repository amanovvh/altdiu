import { cn } from '@/lib/utils/cn';

interface BaseProps {
  label: string;
  name: string;
  required?: boolean;
  hint?: string;
  error?: string;
}

interface InputProps extends BaseProps {
  type?: 'text' | 'email' | 'url' | 'tel' | 'number' | 'password' | 'date' | 'datetime-local';
  defaultValue?: string | number;
  placeholder?: string;
  autoComplete?: string;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface TextareaProps extends BaseProps {
  defaultValue?: string;
  placeholder?: string;
  rows?: number;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

interface SelectProps extends BaseProps {
  defaultValue?: string;
  options: { value: string; label: string }[];
}

export function AdminInput({
  label,
  name,
  type = 'text',
  required,
  hint,
  error,
  defaultValue,
  placeholder,
  autoComplete,
  min,
  max,
  step,
  onChange,
}: InputProps) {
  return (
    <Field label={label} name={name} required={required} hint={hint} error={error}>
      <input
        type={type}
        id={name}
        name={name}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoComplete={autoComplete}
        min={min}
        max={max}
        step={step}
        onChange={onChange}
        className={inputClass(error)}
      />
    </Field>
  );
}

export function AdminTextarea({
  label,
  name,
  required,
  hint,
  error,
  defaultValue,
  placeholder,
  rows = 5,
  onChange,
}: TextareaProps) {
  return (
    <Field label={label} name={name} required={required} hint={hint} error={error}>
      <textarea
        id={name}
        name={name}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        rows={rows}
        onChange={onChange}
        className={inputClass(error) + ' resize-y min-h-[100px]'}
      />
    </Field>
  );
}

export function AdminSelect({
  label,
  name,
  required,
  hint,
  error,
  defaultValue,
  options,
}: SelectProps) {
  return (
    <Field label={label} name={name} required={required} hint={hint} error={error}>
      <select
        id={name}
        name={name}
        required={required}
        defaultValue={defaultValue}
        className={inputClass(error)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

function Field({
  label,
  name,
  required,
  hint,
  error,
  children,
}: BaseProps & { children: React.ReactNode }) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-sm font-medium text-primary-800"
      >
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="mt-1 text-xs text-ink-500">{hint}</p>
      )}
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}

function inputClass(error?: string) {
  return cn(
    'block w-full rounded-lg border bg-white px-3 py-2 text-sm text-primary-900 placeholder:text-ink-400',
    'focus:outline-none focus:ring-2 focus:ring-accent-200 focus:border-accent-400',
    error ? 'border-rose-300' : 'border-ink-200'
  );
}
