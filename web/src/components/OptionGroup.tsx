interface OptionGroupProps<T extends number | string> {
    label: string;
    name: string;
    options: { value: T; label: string }[];
    value: T;
    hint?: string;
    onChange: (value: T) => void;
}

export function OptionGroup<T extends number | string>({
    label,
    name,
    options,
    value,
    hint,
    onChange,
}: OptionGroupProps<T>) {
    return (
        <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-xs font-bold uppercase tracking-widest text-muted">{label}</legend>
            <div className="flex flex-wrap gap-2">
                {options.map((option) => (
                    <label
                        key={option.value}
                        className="grid min-h-11 min-w-11 cursor-pointer place-items-center border-2 border-line-strong px-4 text-sm font-bold uppercase tracking-wider text-muted transition hover:border-fg hover:text-fg has-checked:border-accent has-checked:bg-accent has-checked:text-bg has-focus-visible:outline-3 has-focus-visible:outline-offset-3 has-focus-visible:outline-accent"
                    >
                        <input
                            type="radio"
                            name={name}
                            value={option.value}
                            checked={option.value === value}
                            onChange={() => onChange(option.value)}
                            className="sr-only"
                        />
                        {option.label}
                    </label>
                ))}
            </div>
            {hint && <p className="text-sm text-muted">{hint}</p>}
        </fieldset>
    );
}