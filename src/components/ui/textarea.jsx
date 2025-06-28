export function Textarea({ value, onChange, placeholder, className = '' }) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full p-2 border rounded shadow-sm ${className}`}
      rows={4}
    />
  );
}
