module.exports = {
    extends: [
        '@ecomfe/eslint-config',
        '@ecomfe/eslint-config/typescript'
    ],
    parser: '@typescript-eslint/parser',
    rules: {
        'comma-dangle': 'off',
        'brace-style': 'off',
        'prefer-rest-params': 'off',
        'no-unused-vars': 'error',
        'no-console': 'error',
        'guard-for-in': 'error',
        'no-dupe-class-members': 'off',
        'no-redeclare': 'off',
        '@typescript-eslint/prefer-for-of': 'off',
        '@typescript-eslint/init-declarations': 'off'
    }
};
