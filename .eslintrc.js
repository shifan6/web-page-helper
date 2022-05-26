module.exports = {
  root: true,
  env: {
    es6: true,
    browser: true,
    node: true,
    commonjs: true,
    amd: true,
  },
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
    parser: 'babel-eslint'
  },
  // add your custom rules here
  //it is base on https://github.com/vuejs/eslint-config-vue
  'rules': {
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
  }
}
