import { type KeyboardEvent, type ReactNode, useId, useRef } from "react";

export interface Tab {
    id: string;
    label: string;
    content: ReactNode;
}

interface TabsProps {
    label: string;
    tabs: Tab[];
    selected: string;
    onSelect: (id: string) => void;
}

export function Tabs({ label, tabs, selected, onSelect }: TabsProps) {
    const baseId = useId();
    const buttons = useRef<(HTMLButtonElement | null)[]>([]);

    function handleKeyDown(event: KeyboardEvent, index: number) {
        if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
            return;
        }
        const step = event.key === "ArrowRight" ? 1 : -1;
        const nextIndex = (index + step + tabs.length) % tabs.length;
        onSelect(tabs[nextIndex].id);
        buttons.current[nextIndex]?.focus();
    }

    return (
        <div>
            <div
                role="tablist"
                aria-label={label}
                className="flex overflow-x-auto border-y border-t-2 border-line border-t-fg"
            >
                {tabs.map((tab, index) => {
                    const active = tab.id === selected;
                    return (
                        <button
                            key={tab.id}
                            ref={(element) => {
                                buttons.current[index] = element;
                            }}
                            type="button"
                            role="tab"
                            id={`${baseId}-tab-${tab.id}`}
                            aria-controls={`${baseId}-panel-${tab.id}`}
                            aria-selected={active}
                            tabIndex={active ? 0 : -1}
                            onClick={() => onSelect(tab.id)}
                            onKeyDown={(event) => handleKeyDown(event, index)}
                            className={`min-h-12 shrink-0 px-5 text-sm font-bold uppercase tracking-widest transition-colors ${
                                active ? "bg-fg text-bg" : "text-muted hover:text-fg"
                            }`}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>
            {tabs.map((tab) => (
                <div
                    key={tab.id}
                    role="tabpanel"
                    id={`${baseId}-panel-${tab.id}`}
                    aria-labelledby={`${baseId}-tab-${tab.id}`}
                    hidden={tab.id !== selected}
                    className="pt-7"
                >
                    {tab.content}
                </div>
            ))}
        </div>
    );
}
