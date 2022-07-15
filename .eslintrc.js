module.exports = {
    root: true,
    env: {
        browser: true,
        es6: true,
    },
    extends: [
        "airbnb-typescript",
        "airbnb/hooks",
        "plugin:testing-library/react",
        "plugin:react/recommended",
        "plugin:prettier/recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:import/recommended",
        "plugin:jsx-a11y/recommended"
    ],
    plugins: ["react-hooks", "@typescript-eslint", "prettier"],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 2018,
        sourceType: 'module',
        project: "./tsconfig.json",
    },
    rules: {
        "comma-dangle": ["error", "never"],
        "eol-last": ["error", "always"],
        "brace-style": "error",
        "block-spacing": "error",
        "react/react-in-jsx-scope": 0,
        "react/prop-types": 0,
        "react/static-property-placement": 0,
        "import/no-named-as-default": 0,
        "import/no-cycle": 0,
        "jsx-a11y/anchor-is-valid": ["error", { components: ["a"] }],
        "jsx-a11y/click-events-have-key-events": "off",
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",
        "no-underscore-dangle": ["error", { allow: ["__typename"] }],
        "@typescript-eslint/no-use-before-define": ["error", { functions: false }],
        "testing-library/no-manual-cleanup": "error",
        "testing-library/prefer-screen-queries": "error",
        "testing-library/prefer-wait-for": "error",
        "testing-library/prefer-presence-queries": "error",
        "no-param-reassign": 0,
        "no-return-await": 0,
        "no-console": 0,
        "no-plusplus": 0,
        "no-shadow": "off",
        "@typescript-eslint/no-unused-expressions": 0,
        "@typescript-eslint/no-unused-vars": "error",
        "class-methods-use-this": 0,
        "no-restricted-globals": 0,
        "@typescript-eslint/no-shadow": [
            "error",
            {
                ignoreFunctionTypeParameterNameValueShadow: true,
                ignoreTypeValueShadow: true,
            },
        ],
        "@typescript-eslint/ban-ts-comment": "off",
        "@typescript-eslint/naming-convention": [
            "warn",
            {
                selector: "interface",
                format: ["PascalCase"],
                custom: {
                    regex: "^I[A-Z]",
                    match: true,
                },
            },
        ],
        "@typescript-eslint/typedef": [
            "error",
            {
                "arrowParameter": false,
                "variableDeclaration": false
            }
        ],
        "@typescript-eslint/dot-notation": 0,
        'jsx-a11y/no-static-element-interactions': [
            'warn',
            {
                handlers: [
                    'onClick',
                    'onMouseUp',
                    'onKeyPress',
                    'onKeyDown',
                    'onKeyUp',
                ],
            },
        ],
        "arrow-parens": ["error", "as-needed"],
        "implicit-arrow-linebreak": "off",
        "prettier/prettier": [
            "error",
            {
                endOfLine: "auto",
            },
        ],
        "jsx-a11y/label-has-associated-control": [
            2,
            {
                labelAttributes: ["label"],
                controlComponents: ["Field"],
                depth: 3,
            },
        ],
        "padding-line-between-statements": [
            "error",
            { blankLine: "always", prev: ["const", "let", "var"], next: "*" },
            { blankLine: "any", prev: ["const", "let", "var"], next: ["const", "let", "var"] },
        ],
        "newline-before-return": ["error"],
        "import/order": [
            "error",
            {
                "newlines-between": "always",
                groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
            },
        ],
        "import/no-named-as-default-member": ["off"],
        "import/extensions": [
            "error",
            "ignorePackages",
            {
                "js": "never",
                "jsx": "never",
                "ts": "never",
                "tsx": "never"
            },
        ],
    },
    overrides: [
        {
            files: ["*.tsx"],
            rules: {
                "no-param-reassign": 0,
                "react/jsx-props-no-spreading": 0,
                "react/state-in-constructor": 0,
                "react/react-in-jsx-scope": 0,
            },
        },
    ],
    settings: {
        "import/resolver": {
            node: {
                paths: ["src"],
                extensions: [".js", ".jsx", ".ts", ".tsx"],
            },
        },
    },
};
