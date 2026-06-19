module.exports = {
  // TypeScript & JavaScript — type check + lint + format
  '**/*.{ts,tsx}': (filenames) => [
    `prettier --write ${filenames.join(' ')}`,
    `eslint --fix ${filenames.join(' ')} --max-warnings=0`,
  ],
  // JavaScript
  '**/*.{js,jsx}': (filenames) => [
    `prettier --write ${filenames.join(' ')}`,
    `eslint --fix ${filenames.join(' ')} --max-warnings=0`,
  ],
  // JSON, YAML, Markdown
  '**/*.{json,yaml,yml,md}': (filenames) =>
    `prettier --write ${filenames.join(' ')}`,
  // Prisma schema
  '**/schema.prisma': () => 'pnpm db:generate',
};
