export const ColorTokens = Object.freeze({
    primary: "#006947",
    container: "#a0f7ca",
    background: "#f8faf9",
    ink: "#22302a",
    muted: "#5d6963",
    white: "#ffffff"
});

export const SpacingTokens = Object.freeze({
    xs: "0.5rem",
    sm: "0.75rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    xxl: "2.5rem"
});

export const ShadowTokens = Object.freeze({
    soft: "0 12px 32px rgba(0, 105, 71, 0.08)",
    card: "0 18px 36px rgba(35, 48, 42, 0.08)",
    glow: "0 0 30px rgba(160, 247, 202, 0.42)"
});

export const RadiusTokens = Object.freeze({
    lg: "2rem",
    xl: "2.5rem"
});

export function CardBase(extraClass = "") {
    return `ll-card-base ${extraClass}`.trim();
}

export function CardGlow(extraClass = "") {
    return `ll-card-glow ${extraClass}`.trim();
}

