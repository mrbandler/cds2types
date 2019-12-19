/* eslint-disable @typescript-eslint/explicit-function-return-type */
module.exports = {
    extends: ["@commitlint/config-conventional"],
    parserPreset: "conventional-changelog-atom",
    formatter: "@commitlint/format",
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
    },
    ignores: [message => /^((?:Merge|Merged){1}).*/.test(message)],
    defaultIgnores: true,
};
