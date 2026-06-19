/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // Nova funcionalidade
        'fix',      // Correção de bug
        'docs',     // Documentação
        'style',    // Formatação, sem mudança de lógica
        'refactor', // Refatoração sem feat ou fix
        'perf',     // Melhoria de performance
        'test',     // Testes
        'build',    // Sistema de build, deps externas
        'ci',       // CI/CD
        'chore',    // Tarefas de manutenção
        'revert',   // Revert de commit anterior
        'wip',      // Work in progress (apenas em branches de feature)
      ],
    ],
    'scope-enum': [
      1,
      'always',
      [
        'web',
        'api-gateway',
        'auth',
        'crm',
        'finance',
        'notification',
        'ai',
        'workflow',
        'database',
        'shared',
        'types',
        'infra',
        'docker',
        'ci',
        'docs',
        'deps',
      ],
    ],
    'subject-max-length': [2, 'always', 100],
    'body-max-line-length': [2, 'always', 200],
  },
};
