export const commitHash = import.meta.env.commitHash ?? "development"
export const shortCommitHash = import.meta.env.commitHash?.slice(0, 7) ?? "development"