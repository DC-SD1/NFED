module.exports = {
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix --cache --cache-location node_modules/.cache/.eslintcache',
    'prettier --write --cache --cache-location=node_modules/.cache/.prettiercache',
  ],
  '*.{json,md,mdx,css,html,yml,yaml,scss}': [
    'prettier --write --cache --cache-location=node_modules/.cache/.prettiercache',
  ],
};