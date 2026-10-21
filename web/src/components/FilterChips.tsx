interface Option {
    value: string;
    label: string;
}

interface FilterChipsProps {
    label: string;
    options: Option[];
    selected: string;
    onSelect: (value: string) => void;
}

export function FilterChips({ label, options, selected, onSelect }: FilterChipsProps) {
    return (
        <fieldset className="flex flex-wrap items-center gap-2">
            <legend className="sr-only">{label}</legend>
            {options.map((option) => {
                const active = option.value === selected;
                return (
                    <button
                        key={option.value}
                        type="button"
                        aria-pressed={active}
                        onClick={() => onSelect(option.value)}
                        className={`min-h-11 border-2 px-4 text-sm font-bold uppercase tracking-wider transition ${
                            active
                                ? "border-accent bg-accent text-bg"
                                : "border-line-strong text-muted hover:border-fg hover:text-fg"
                        }`}
                    >
                        {option.label}
                    </button>
                );
            })}
        </fieldset>
    );
}