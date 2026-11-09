import type { ChangeEvent } from 'react';

export function AmountField({
  id,
  label,
  value,
  onChange,
  unit,
  maxLabel,
  onMax,
  helper,
  error,
  disabled = false,
  placeholder = '0.00',
  autoFocus = false,
  testId,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  unit: string;
  maxLabel?: string;
  onMax?: () => void;
  helper?: string;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  testId?: string;
}) {
  return (
    <div className={`amount-field${error ? ' amount-field--error' : ''}`}>
      <div className="amount-field__top">
        <label htmlFor={id} className="amount-field__label">
          {label}
        </label>
        {maxLabel ? <span className="amount-field__balance">{maxLabel}</span> : null}
      </div>
      <div className="amount-field__control">
        <input
          id={id}
          className="amount-field__input"
          inputMode="decimal"
          autoComplete="off"
          spellCheck={false}
          value={value}
          onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          aria-describedby={`${id}-help`}
          aria-invalid={error ? true : undefined}
          data-testid={testId}
        />
        <span className="amount-field__unit">{unit}</span>
        {onMax ? (
          <button
            type="button"
            className="amount-field__max"
            onClick={onMax}
            disabled={disabled}
            aria-label={`Use maximum ${unit}`}
          >
            MAX
          </button>
        ) : null}
      </div>
      <div
        id={`${id}-help`}
        className={`amount-field__help${error ? ' amount-field__help--error' : ''}`}
        role={error ? 'alert' : undefined}
      >
        {error ?? helper ?? '\u00a0'}
      </div>
    </div>
  );
}