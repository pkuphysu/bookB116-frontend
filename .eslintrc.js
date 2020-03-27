module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: ['eslint:recommended', 'prettier/vue', 'plugin:vue/recommended'],
  rules: {
    'vue/max-attributes-per-line': [
      'warn',
      {
        singleline: 4
      }
    ],
    'vue/script-indent': 'warn',
    'space-infix-ops': 'warn',
    'max-len': 'warn',
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}
