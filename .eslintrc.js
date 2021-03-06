// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module',
  },
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  extends: 'eslint:recommended',
  plugins: ['html', 'import'],
  rules: {
    'arrow-body-style': [2, 'as-needed'],
    'wrap-iife': [2, 'inside'],
    camelcase: [
      0,
      {
        properties: 'always',
        ignoreDestructuring: true,
      },
    ],
    'no-var': 2,
    'one-var': [2, 'never'],
    'no-undef-init': 2,
    // "eqeqeq": [2, "smart"],
    'default-case': 2,
    'prefer-template': 2,
    'no-useless-concat': 2,
    'no-multi-str': 2,
    'no-new-object': 2,
    'object-shorthand': [2, 'always'],
    'prefer-object-spread': 2,
    'no-array-constructor': 2,
    'max-params': [2, 6],
    'prefer-rest-params': 2,
    'no-useless-constructor': 2,
    'no-eval': 2,
    'no-throw-literal': 2,
    'no-console': ['error', { allow: ['warn', 'error', 'info', 'trace'] }],
    'import/no-unresolved': [2, { commonjs: true, amd: true }],
    'import/namespace': 2,
    'import/default': 2,
    'import/export': 2,
    'no-unused-vars': [0, { vars: 'regeneratorRuntime' }],
    'import/named': 2,
  },
  globals: {
    wx: true,
    App: true,
    Page: true,
    getApp: true,
    Component: true,
    Behavior: true,
    getCurrentPages: true,
  },
};
