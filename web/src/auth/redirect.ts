export function safeRedirect(target: string | null) {
    if (!target?.startsWith("/") || target.startsWith("//") || target.startsWith("/\\")) {
        return "/panel";
    }
    return target;
}
