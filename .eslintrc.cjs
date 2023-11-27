// eslint-disable-next-line no-undef
module.exports = {
  'env': {
    'browser': true,
    'es2021': true,
  },
  'plugins': ['jsdoc'],
  'extends': [
    'eslint:recommended',
    'google',
    'plugin:jsdoc/recommended-typescript-flavor',
  ],
  'parserOptions': {
    'ecmaVersion': 'latest',
    'sourceType': 'module',
  },
  'rules': {
    'valid-jsdoc': 0,
    'no-unused-vars': 'off',
    'max-len': ['error', {'code': 100}],
  },
  'globals': {
    'process': 'true',
  },
};
