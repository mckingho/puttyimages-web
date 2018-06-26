export const ONE_DATE_IN_MS = 86400000;

export const SUPPORTED_IMAGE_TYPE = new Set(['jpg', 'png']);

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10M
export const MAX_IMAGE_SIZE_MB = '10MB';

export const MAX_TAG_COUNT = 5;

export const MAX_TAG_LENGTH = 20;

export const MIN_TAG_LENGTH = 2;

export const RESULT_PER_PAGE = 15;

export const SUPPORTED_LICENSE = new Set([
  'cc0',
  'cc-by',
  'cc-by-sa',
  'cc-by-nd',
]);

export const EMBEDDED_SCRIPT_IN_HEAD = `<script src="https://code.puttyimage.io/latest/polyfill.min.js"></script>`;

/* eslint-disable sort-keys */
export const LOG_LEVEL_MAP = {
  all: 0,
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
  off: 70,
};
/* eslint-enable sort-keys */
