import wordCounter from './word-counter.js';
import caseConverter from './case-converter.js';
import findReplace from './find-replace.js';
import lineTools from './line-tools.js';
import textDiff from './text-diff.js';
import jsonFormatter from './json-formatter.js';
import encoder from './encoder.js';
import jwtDecoder from './jwt-decoder.js';
import hashGenerator from './hash-generator.js';
import uuidTime from './uuid-time.js';
import colorConverter from './color-converter.js';
import passwordGenerator from './password-generator.js';
import qrCode from './qr-code.js';
import pomodoro from './pomodoro.js';

const GROUP_ORDER = ['Text', 'Developer', 'Everyday'];

// Tools are listed in group order; the sort keeps the order within each group.
export const TOOLS = [
  wordCounter, caseConverter, findReplace, lineTools, textDiff,
  jsonFormatter, encoder, jwtDecoder, hashGenerator, uuidTime, colorConverter,
  passwordGenerator, qrCode, pomodoro,
].sort((a, b) => GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group));
