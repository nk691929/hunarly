module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-enum": [
      1,
      "always",
      ["tooling", "ui", "brand", "config", "builder", "templates", "auth", "billing", "seo",
       "pdf", "ai", "dashboard", "ci", "docs", "deps", "db", "security"],
    ],
  },
};
