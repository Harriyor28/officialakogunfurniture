export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string | null;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="label">
        {label}
        {required ? <span className="ml-1 text-gold">*</span> : <span className="ml-1 opacity-60">(optional)</span>}
      </label>
      {children}
      {hint && !error ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}

export function TextInput({
  id,
  name,
  type = "text",
  defaultValue,
  placeholder,
  required,
  autoComplete,
  min,
  max,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { id: string; name: string }) {
  return (
    <input
      id={id}
      name={name}
      type={type}
      defaultValue={defaultValue}
      placeholder={placeholder}
      required={required}
      autoComplete={autoComplete}
      min={min}
      max={max}
      className="input"
      {...rest}
    />
  );
}

export function TextArea({
  id,
  name,
  defaultValue,
  placeholder,
  rows = 5,
  required,
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { id: string; name: string }) {
  return (
    <textarea
      id={id}
      name={name}
      defaultValue={defaultValue}
      placeholder={placeholder}
      rows={rows}
      required={required}
      className="input resize-y"
      {...rest}
    />
  );
}

export function Select({
  id,
  name,
  defaultValue,
  options,
  required,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  id: string;
  name: string;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <select id={id} name={name} defaultValue={defaultValue} required={required} className="input" {...rest}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function Checkbox({
  id,
  name,
  defaultChecked,
  label,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { id: string; name: string; label: React.ReactNode }) {
  return (
    <label htmlFor={id} className="flex items-start gap-3 text-sm text-ivory/80">
      <input
        id={id}
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="mt-1 size-4 shrink-0 accent-[#C6A66B]"
        {...rest}
      />
      <span>{label}</span>
    </label>
  );
}
