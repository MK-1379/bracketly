import { useNavigate } from "react-router";
import { useCurrentUser } from "../auth/useAuth";
import { ConfirmButton } from "../components/ConfirmButton";
import type { MyTeam } from "./teams.api";
import { useRemoveMember } from "./useTeams";

const joinedFormat = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric" });

export function MemberList({ team }: { team: MyTeam }) {
    const { data: me } = useCurrentUser();
    const removeMember = useRemoveMember();
    const navigate = useNavigate();

    function remove(userId: number) {
        const isLeaving = userId === me?.id;
        removeMember.mutate(
            { teamId: team.id, userId },
            { onSuccess: () => isLeaving && navigate("/panel", { replace: true }) },
        );
    }

    return (
        <div className="flex flex-col gap-3">
            <ul className="flex flex-col border border-line">
                {team.members.map(({ user, joinedAt }) => {
                    const isCaptain = user.id === team.captain.id;
                    const isMe = user.id === me?.id;
                    const canKick = team.isCaptain && !isCaptain;
                    const canLeave = isMe && !isCaptain;

                    return (
                        <li
                            key={user.id}
                            className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface px-4 py-3 last:border-b-0"
                        >
                            <span className="flex flex-col">
                                <strong className="flex flex-wrap items-center gap-2">
                                    {user.displayName}
                                    {isMe && <span className="text-sm font-normal text-muted">(tú)</span>}
                                    {isCaptain && (
                                        <span className="bg-accent px-2 py-0.5 text-xs font-bold uppercase tracking-widest text-bg">
                                            Capitán
                                        </span>
                                    )}
                                </strong>
                                <span className="text-sm text-muted">
                                    Desde el {joinedFormat.format(new Date(joinedAt))}
                                </span>
                            </span>
                            {canKick && (
                                <ConfirmButton
                                    label="Expulsar"
                                    question={`¿Expulsar a ${user.displayName}?`}
                                    pending={removeMember.isPending && removeMember.variables.userId === user.id}
                                    onConfirm={() => remove(user.id)}
                                />
                            )}
                            {canLeave && (
                                <ConfirmButton
                                    label="Salir del equipo"
                                    question="¿Seguro que quieres salir?"
                                    pending={removeMember.isPending}
                                    onConfirm={() => remove(user.id)}
                                />
                            )}
                        </li>
                    );
                })}
            </ul>
            {removeMember.isError && (
                <p role="alert" className="text-sm font-semibold text-live">
                    No se ha podido completar la acción. Inténtalo de nuevo.
                </p>
            )}
        </div>
    );
}
