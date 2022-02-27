module.exports = {
  rules: {
    "node/no-unsupported-features/es-syntax": [
      "error",
      { ignores: ["modules", "import"] },
    ],
    "react/jsx-uses-react": "error",
    "react/jsx-uses-vars": "error",
    "react/jsx-filename-extension": [1, { extensions: [".js", ".jsx"] }],
    indent: ["error", 2],
    "linebreak-style": ["error", "unix"],
  },
  env: {
    browser: false,
    es2021: true,
    mocha: true,
    node: true,
    jest: true,
  },
  extends: [
    "standard",
    // "plugin:react/recommended",
    "plugin:prettier/recommended",
    // "plugin:node/recommended",
  ],
  plugins: ["react"],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  overrides: [
    {
      files: ["hardhat.config.js"],
      globals: { task: true },
    },
  ],
};
