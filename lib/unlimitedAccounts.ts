const UNLIMITED_ACCOUNTS = new Set<string>(["darbot@timelarp.com"]);

export const isUnlimitedAccount = (email?: string | null): boolean => {
    if (!email) {
        return false;
    }
    return UNLIMITED_ACCOUNTS.has(email.trim().toLowerCase());
};

export const isUnlimitedUserRecord = (user: unknown): boolean => {
    if (!user || typeof user !== "object") {
        return false;
    }

    const record = user as Record<string, unknown>;
    const email = typeof record.email === "string" ? record.email : undefined;
    return isUnlimitedAccount(email);
};
