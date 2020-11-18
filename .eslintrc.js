module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    plugins: ["prettier", "@typescript-eslint", "ts-immutable"],
    extends: ["plugin:prettier/recommended", "plugin:@typescript-eslint/recommended", "plugin:ts-immutable/functional"],
    rules: {
        "prettier/prettier": ["error", { endOfLine: "auto" }],
        "@typescript-eslint/no-empty-interface": ["off", false],
        "ts-immutable/functional-parameters": ["off", false],
    },
};
