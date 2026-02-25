module.exports = {
  // 环境：适配浏览器、Node、Vue3
  env: {
    browser: true,
    es2021: true,
    node: true,
    "vue/setup-compiler-macros": true // 支持 Vue3 <script setup>
  },
  // 解析器：专门解析 Vue 文件
  parser: "vue-eslint-parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    parser: "@typescript-eslint/parser" // 兼容 TS（无 TS 也不影响）
  },
  // 核心规则集：Vue 官方规则 + Prettier 联动
  extends: [
    "eslint:recommended",
    "plugin:vue/vue3-essential", // Vue3 基础规则
    "plugin:prettier/recommended" // Prettier 规则（自动关闭冲突规则）
  ],
  plugins: ["vue", "prettier"],
  // 自定义规则：明确格式要求 + 提示未使用变量
  rules: {
    "prettier/prettier": "error", // Prettier 格式错误报红
    "vue/mustache-interpolation-spacing": "error", // 插值表达式必须有空格
    "no-unused-vars": "warn", // 未使用变量警告
    "space-in-parens": "error", // 括号内必须有空格（如 {a: 1} 而非 {a:1}）
    "space-before-function-paren": ["error", "never"], // 函数名后无空格（如 func() 而非 func ()）
    "space-infix-ops": "error" // 运算符前后必须有空格（如 a + b 而非 a+b）
  }
};