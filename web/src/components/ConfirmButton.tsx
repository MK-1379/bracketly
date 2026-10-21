import { useEffect, useRef, useState } from "react";
import { Button } from "./Button";
import type { ButtonVariant } from "./buttonClass";

interface ConfirmButtonProps {
    label: string;
    question: string;
    pending?: boolean;
    disabled?: boolean;
    variant?: ButtonVariant;
    onConfirm: () => void;
}

export function ConfirmButton({
    label,
    question,
    pending = false,
    disabled = false,
    variant = "danger",
    onConfirm,
}: ConfirmButtonProps) {
    const [asking, setAsking] = useState(false);
    const cancelRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (asking) {
            cancelRef.current?.focus();
        }
    }, [asking]);

    if (!asking) {
        return (
            <Button variant={variant} disabled={pending || disabled} onClick={() => setAsking(true)}>
                {pending ? "..." : label}
            </Button>
        );
    }

    return (
        <span className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold">{question}</span>
            <Button
                variant={variant}
                onClick={() => {
                    setAsking(false);
                    onConfirm();
                }}
            >
                Sí
            </Button>
            <Button ref={cancelRef} variant="outline" onClick={() => setAsking(false)}>
                No
            </Button>
        </span>
    );
}