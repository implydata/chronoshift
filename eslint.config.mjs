/*
 * Copyright (c) Imply Data, Inc. All rights reserved.
 *
 * This software is the confidential and proprietary information
 * of Imply Data, Inc.
 */

import awesomeCodeStyle, { configs } from '@awesome-code-style/eslint-config';
import notice from 'eslint-plugin-notice';
import globals from 'globals';

const TYPESCRIPT_FILES = ['**/*.ts', '**/*.tsx'];

export default [
  ...awesomeCodeStyle,
  ...configs.typeChecked.map(config => ({ ...config, files: TYPESCRIPT_FILES })),
  {
    plugins: {
      notice,
    },
    rules: {
      'notice/notice': [2, { mustMatch: 'Copyright (\\(c\\)|[\\d+-]+) Imply Data, Inc.' }],
    },
  },
  {
    files: ['*.mjs'],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      '@typescript-eslint/no-require-imports': [0],
    },
  },
];
