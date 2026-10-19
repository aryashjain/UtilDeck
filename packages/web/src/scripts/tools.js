// Single source of truth for the toolkit. The landing page, the search box and
// the nav all read from here. To add a tool: add an entry below and create its
// page in pages/. Paths are relative to packages/web/src.

export const CATEGORIES = [
  { id: 'analyze', name: 'Analyze' },
  { id: 'clean', name: 'Clean & Transform' },
  { id: 'compare', name: 'Compare' },
  { id: 'developer', name: 'Developer' },
  { id: 'generate', name: 'Generate' },
  { id: 'image', name: 'Images' },
  { id: 'fitness', name: 'Fitness' },
  { id: 'json', name: 'JSON' },
  { id: 'convert', name: 'Convert' },
  { id: 'calculate', name: 'Calculate' },
  { id: 'everyday', name: 'Everyday' },
  { id: 'fun', name: 'Fun' },
];

export const NOTEPAD = {
  name: 'Notepad',
  path: 'pages/notepad.html',
  icon: '📋',
  description: 'Autosaving notes in your browser, with live stats and shareable links.',
  keywords: ['note', 'notes', 'write', 'writing', 'autosave', 'share'],
};

export const TOOLS = [
  {
    name: 'Word Counter',
    path: 'pages/word-counter.html',
    icon: '📊',
    category: 'analyze',
    description: 'Words, characters, sentences, paragraphs and reading time.',
    keywords: ['count', 'characters', 'sentences', 'paragraphs', 'reading time'],
  },
  {
    name: 'Typing Speed',
    path: 'pages/speed-counter.html',
    icon: '⚡',
    category: 'analyze',
    description: 'Timed typing test that measures your words per minute.',
    keywords: ['wpm', 'typing', 'test', 'speed', 'words per minute'],
  },
  {
    name: 'Case Converter',
    path: 'pages/case-converter.html',
    icon: 'Aa',
    category: 'clean',
    description: 'UPPER, lower, Title, Sentence, camelCase, snake_case and more.',
    keywords: ['uppercase', 'lowercase', 'title case', 'camel', 'snake', 'kebab', 'pascal'],
  },
  {
    name: 'Space Remover',
    path: 'pages/space-remover.html',
    icon: '−',
    category: 'clean',
    description: 'Remove extra spaces and line breaks in one click.',
    keywords: ['whitespace', 'trim', 'spaces', 'line breaks', 'clean'],
  },
  {
    name: 'Line Tools',
    path: 'pages/line-tools.html',
    icon: '≡',
    category: 'clean',
    description: 'Sort, deduplicate and reverse lines of text.',
    keywords: ['sort', 'dedupe', 'duplicate', 'unique', 'lines', 'reverse'],
  },
  {
    name: 'Find & Replace',
    path: 'pages/find-replace.html',
    icon: '🔍',
    category: 'clean',
    description: 'Replace text in bulk, with optional regular expressions.',
    keywords: ['regex', 'regular expression', 'replace', 'substitute', 'search'],
  },
  {
    name: 'Text Extractor',
    path: 'pages/extractor.html',
    icon: '🧲',
    category: 'clean',
    description: 'Pull emails, URLs, numbers and hashtags out of any text.',
    keywords: ['emails', 'urls', 'links', 'numbers', 'hashtags', 'extract', 'scrape'],
  },
  {
    name: 'Text Diff',
    path: 'pages/text-diff.html',
    icon: '⇄',
    category: 'compare',
    description: 'Compare two texts side by side and see what changed.',
    keywords: ['compare', 'difference', 'changes', 'diff'],
  },
  {
    name: 'JSON Compare',
    path: 'pages/json-compare.html',
    icon: '⚖️',
    category: 'json',
    textCard: true,
    description: 'Compare two JSON documents. See each changed value by path and the changed lines.',
    keywords: ['json', 'compare', 'diff', 'difference', 'changes', 'json diff'],
  },
  {
    name: 'JSON Mock Generator',
    path: 'pages/json-mock-generator.html',
    icon: '{ }',
    category: 'json',
    textCard: true,
    description: 'Generate mock JSON with a chosen number of keys and nesting depth. Copy or download it.',
    keywords: ['json', 'mock', 'fake', 'random', 'generator', 'sample', 'test data', 'nested', 'keys'],
  },
  {
    name: 'Encoder',
    path: 'pages/encoder.html',
    icon: '🔣',
    category: 'developer',
    description: 'Encode and decode Base64, URL and HTML entities.',
    keywords: ['base64', 'url', 'html entities', 'escape', 'decode', 'encode'],
  },
  {
    name: 'JSON Formatter',
    path: 'pages/json-formatter.html',
    icon: '{}',
    category: 'json',
    description: 'Format, minify and validate JSON.',
    keywords: ['json', 'pretty print', 'beautify', 'minify', 'validate', 'lint'],
  },
  {
    name: 'Generators',
    path: 'pages/generators.html',
    icon: '✨',
    category: 'generate',
    description: 'Lorem ipsum placeholder text and URL-friendly slugs.',
    keywords: ['lorem', 'ipsum', 'placeholder', 'slug', 'url'],
  },
  {
    name: 'Email Generator',
    path: 'pages/email-generator.html',
    icon: '✉️',
    category: 'generate',
    textCard: true,
    description: 'Make 1 to 10,000 random test email addresses. Copy them or download CSV or XLS.',
    keywords: ['email', 'emails', 'random email', 'fake email', 'test email', 'csv', 'xls', 'excel', 'list', 'generator'],
  },
  {
    name: 'Password Generator',
    path: 'pages/password-generator.html',
    icon: '🔑',
    category: 'generate',
    description: 'Strong random passwords made with your browser’s secure random source.',
    keywords: ['password', 'random', 'secure', 'passphrase', 'string'],
  },
  {
    name: 'Image Compressor',
    path: 'pages/image-compressor.html',
    icon: '🗜️',
    category: 'image',
    description: 'Shrink JPEG, WebP or PNG images with a quality slider. Runs in your browser.',
    keywords: ['image', 'compress', 'compression', 'resize', 'jpeg', 'webp', 'png', 'reduce size'],
  },
  {
    name: 'Image Cropper',
    path: 'pages/image-cropper.html',
    icon: '✂️',
    category: 'image',
    description: 'Crop images by dragging a box, with preset aspect ratios.',
    keywords: ['image', 'crop', 'trim', 'aspect ratio', 'photo', 'picture'],
  },
  {
    name: 'Calorie Counter',
    path: 'pages/calorie-counter.html',
    icon: '🔥',
    category: 'fitness',
    textCard: true,
    description: 'Estimate your daily calories, protein, carbs and fat from your body stats and activity.',
    keywords: ['calorie', 'calories', 'calculator', 'macros', 'tdee', 'bmr', 'protein', 'carbs', 'fat', 'diet', 'weight'],
  },
  {
    name: 'What Should I Eat?',
    path: 'pages/meal-picker.html',
    icon: '🍽️',
    category: 'fitness',
    textCard: true,
    description: 'Pick a meal by diet, meal time and cuisine, and see its macros.',
    keywords: ['meal', 'food', 'eat', 'recipe', 'diet', 'vegetarian', 'breakfast', 'lunch', 'dinner', 'snack', 'indian', 'italian', 'chinese', 'mexican', 'japanese', 'macros'],
  },
  {
    name: 'Unit Converter',
    path: 'pages/unit-converter.html',
    icon: '📏',
    category: 'convert',
    textCard: true,
    description: 'Convert length, weight, volume, data size and temperature.',
    keywords: ['unit', 'units', 'convert', 'length', 'weight', 'volume', 'miles', 'kilometers', 'pounds', 'kg', 'fahrenheit', 'celsius', 'data size'],
  },
  {
    name: 'Timestamp Converter',
    path: 'pages/timestamp-converter.html',
    icon: '🕒',
    category: 'convert',
    textCard: true,
    description: 'Turn Unix timestamps into dates, and dates into timestamps.',
    keywords: ['timestamp', 'unix', 'epoch', 'date', 'time', 'iso', 'converter'],
  },
  {
    name: 'Color Converter',
    path: 'pages/color-converter.html',
    icon: '🎨',
    category: 'convert',
    textCard: true,
    description: 'Convert HEX, RGB and HSL, and check text contrast for accessibility.',
    keywords: ['color', 'colour', 'hex', 'rgb', 'hsl', 'contrast', 'wcag', 'accessibility', 'picker'],
  },
  {
    name: 'Regex Tester',
    path: 'pages/regex-tester.html',
    icon: '.*',
    category: 'developer',
    textCard: true,
    description: 'Test regular expressions and see every match and capture group.',
    keywords: ['regex', 'regular expression', 'pattern', 'match', 'test', 'javascript'],
  },
  {
    name: 'Hash Generator',
    path: 'pages/hash-generator.html',
    icon: '#',
    category: 'developer',
    textCard: true,
    description: 'Generate SHA-1, SHA-256 and SHA-512 hashes. Computed in your browser.',
    keywords: ['hash', 'sha', 'sha256', 'sha512', 'checksum', 'digest'],
  },
  {
    name: 'Markdown Preview',
    path: 'pages/markdown-preview.html',
    icon: '📝',
    category: 'developer',
    textCard: true,
    description: 'Write Markdown and see the formatted preview live.',
    keywords: ['markdown', 'md', 'preview', 'readme', 'html'],
  },
  {
    name: 'BMI Calculator',
    path: 'pages/bmi-calculator.html',
    icon: '📐',
    category: 'fitness',
    textCard: true,
    description: 'Calculate your body mass index and weight category.',
    keywords: ['bmi', 'body mass index', 'weight', 'height', 'fitness'],
  },
  {
    name: 'Water Intake',
    path: 'pages/water-intake.html',
    icon: '💧',
    category: 'fitness',
    textCard: true,
    description: 'Estimate how much water you need each day, including exercise.',
    keywords: ['water', 'hydration', 'drink', 'intake', 'litres'],
  },
  {
    name: 'Protein Calculator',
    path: 'pages/protein-calculator.html',
    icon: '🥩',
    category: 'fitness',
    textCard: true,
    description: 'Work out your daily protein target from your weight and goal.',
    keywords: ['protein', 'muscle', 'diet', 'gym', 'macros'],
  },
  {
    name: 'Expense Splitter',
    path: 'pages/bill-splitter.html',
    icon: '🧾',
    category: 'calculate',
    textCard: true,
    description: 'Splitwise-style expense splitter: equal, percentage or exact splits, and the fewest payments to settle up.',
    keywords: ['splitwise', 'expense', 'split', 'bill', 'tip', 'percentage', 'share', 'group', 'settle up', 'roommates', 'friends'],
  },
  {
    name: 'Percentage Calculator',
    path: 'pages/percentage-calculator.html',
    icon: '%',
    category: 'calculate',
    textCard: true,
    description: 'Percent of a number, part of a whole, and percent change.',
    keywords: ['percent', 'percentage', 'percent change', 'ratio', 'calculator'],
  },
  {
    name: 'Random Name Picker',
    path: 'pages/random-name-picker.html',
    icon: '🎲',
    category: 'generate',
    textCard: true,
    description: 'Pick winners at random from a list of names.',
    keywords: ['random', 'name picker', 'raffle', 'giveaway', 'winner', 'pick', 'team', 'draw'],
  },
  {
    name: 'Date Calculator',
    path: 'pages/date-calculator.html',
    icon: '📅',
    category: 'everyday',
    textCard: true,
    description: 'Days between dates, working days, add or subtract days, and a live countdown.',
    keywords: ['date', 'days between', 'working days', 'countdown', 'add days', 'calendar', 'deadline', 'business days'],
  },
  {
    name: 'QR Code Generator',
    path: 'pages/qr-code-generator.html',
    icon: '▦',
    category: 'everyday',
    textCard: true,
    description: 'Make a QR code from a link or text. Generated in your browser, downloadable as PNG.',
    keywords: ['qr', 'qr code', 'qrcode', 'barcode', 'link', 'scan', 'generator'],
  },
  {
    name: 'Dice Roller and Coin Flip',
    path: 'pages/dice-and-coin.html',
    icon: '🪙',
    category: 'fun',
    textCard: true,
    description: 'Roll any dice with any number of sides, or flip coins.',
    keywords: ['dice', 'die', 'roll', 'coin', 'flip', 'heads', 'tails', 'd20', 'random', 'game'],
  },
  {
    name: 'JWT Decoder',
    path: 'pages/jwt-decoder.html',
    icon: '🔐',
    category: 'developer',
    textCard: true,
    description: 'Read a JSON Web Token: header, payload, issued and expiry times. Decoding only.',
    keywords: ['jwt', 'json web token', 'token', 'decode', 'bearer', 'claims', 'expiry', 'auth'],
  },
  {
    name: 'Age Calculator',
    path: 'pages/age-calculator.html',
    icon: '🎂',
    category: 'everyday',
    textCard: true,
    description: 'Exact age in years, months and days, and days until the next birthday.',
    keywords: ['age', 'birthday', 'how old', 'years', 'months', 'days', 'calculator'],
  },
  {
    name: 'World Clock and Meeting Planner',
    path: 'pages/world-clock.html',
    icon: '🌍',
    category: 'everyday',
    textCard: true,
    description: 'See the time in many cities, and find meeting hours that work for everyone.',
    keywords: ['world clock', 'time zone', 'timezone', 'meeting', 'planner', 'schedule', 'across time zones'],
  },
  {
    name: 'Pomodoro Timer',
    path: 'pages/pomodoro-timer.html',
    icon: '🍅',
    category: 'everyday',
    textCard: true,
    description: 'Focus and break timer with a sound at each change, for focused work.',
    keywords: ['pomodoro', 'timer', 'focus', 'break', 'productivity', 'study', '25 minutes'],
  },
  {
    name: 'Favicon Generator',
    path: 'pages/favicon-generator.html',
    icon: '🌐',
    category: 'image',
    textCard: true,
    description: 'One image into favicon.ico, PNG favicons, the Apple touch icon and manifest.json.',
    keywords: ['favicon', 'favicon generator', 'ico', 'icon', 'apple touch icon', 'manifest', 'pwa', 'app icon', 'website icon'],
  },
];

const CATEGORY_NAMES = Object.fromEntries(CATEGORIES.map(c => [c.id, c.name]));

export function categoryName(tool) {
  return CATEGORY_NAMES[tool.category] || 'Featured';
}

// Every space-separated term must appear somewhere in a tool's searchable text.
// Name matches rank first, then name-prefix matches, then everything else.
export function searchTools(query) {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  const matches = [NOTEPAD, ...TOOLS]
    .map(tool => {
      const name = tool.name.toLowerCase();
      const haystack = [name, tool.description, categoryName(tool), ...tool.keywords]
        .join(' ')
        .toLowerCase();
      if (!terms.every(term => haystack.includes(term))) return null;
      const rank = name.startsWith(terms[0]) ? 0 : terms.every(term => name.includes(term)) ? 1 : 2;
      return { tool, rank };
    })
    .filter(Boolean);

  return matches.sort((a, b) => a.rank - b.rank).map(m => m.tool);
}
