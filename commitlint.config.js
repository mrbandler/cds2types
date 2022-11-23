export default {
    extends: ["@commitlint/config-conventional"],
    rules: {
        "subject-case": [2, "always", "sentence-case"],
        "type-enum": [
            2,
            "always",
            [
                "feat",
                "fix",
                "docs",
                "style",
                "refactor",
                "test",
                "revert",
                "chore",
                "merge",
                "release",
                "ci",
                "wiki",
            ],
        ],
        "header-max-length": [0, "always", 82],
    },
    ignores: [(message) => /^((?:Merge|Merged){1}).*/.test(message)],
    defaultIgnores: true,
};
