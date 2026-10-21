export function navClass({ isActive }: { isActive: boolean }) {
    return `relative py-1 after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:origin-left after:bg-accent after:transition-transform ${
        isActive ? "after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100"
    }`;
}
