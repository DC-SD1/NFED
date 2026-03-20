// Usage: OptionProps can be used to type option objects for dropdowns or selects, and can be extended with extra fields as needed.
// Example: OptionProps<{ id: string }>
// This defines an option with label, value, and an additional id field.
export type OptionProps<
  Extra extends Record<string, unknown> = Record<string, unknown>
> = {
  label: string;
  value: string;
} & Extra;
