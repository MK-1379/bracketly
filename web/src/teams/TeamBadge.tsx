import { teamColor } from "../utils/bracket";

interface TeamBadgeProps {
    teamId: number;
    tag: string;
    size?: "md" | "lg";
}

export function TeamBadge({ teamId, tag, size = "md" }: TeamBadgeProps) {
    const sizes = size === "lg" ? "size-20 text-2xl" : "size-12 text-sm";

    return (
        <span
            aria-hidden="true"
            className={`grid shrink-0 place-items-center border-2 bg-surface-2 font-display tracking-wide ${sizes}`}
            style={{ borderColor: teamColor(teamId), boxShadow: `4px 4px 0 ${teamColor(teamId)}` }}
        >
            {tag}
        </span>
    );
}
