// Reading level for English text. Flesch Reading Ease and Flesch-Kincaid grade, with a syllable estimate.

export function countSyllables(word) {
  let w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (w.length === 0) return 0;
  if (w.length <= 3) return 1;
  w = w.replace(/eau/g, 'o').replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, '');
  const groups = w.match(/[aeiouy]{1,2}/g);
  return Math.max(1, groups ? groups.length : 1);
}

export function readability(text) {
  const clean = String(text).trim();
  const sentences = clean.split(/[.!?]+(?:\s|$)/).map(s => s.trim()).filter(s => /[A-Za-z]/.test(s));
  const words = (clean.match(/[A-Za-z][A-Za-z'’-]*/g) || []);
  if (words.length < 3) throw new Error('Write at least a few words to measure.');
  const syllables = words.reduce((total, w) => total + countSyllables(w), 0);
  const sentenceCount = Math.max(1, sentences.length);
  const wordsPerSentence = words.length / sentenceCount;
  const syllablesPerWord = syllables / words.length;
  const ease = 206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWord;
  const grade = 0.39 * wordsPerSentence + 11.8 * syllablesPerWord - 15.59;
  const label = ease >= 90 ? 'Very easy (about grade 5)'
    : ease >= 70 ? 'Easy (about grade 6 to 7)'
    : ease >= 60 ? 'Plain English (grade 8 to 9)'
    : ease >= 50 ? 'Fairly difficult (high school to college)'
    : ease >= 30 ? 'Difficult (college)'
    : 'Very difficult (graduate level)';
  return {
    words: words.length,
    sentences: sentenceCount,
    averageWordsPerSentence: Math.round(wordsPerSentence * 10) / 10,
    ease: Math.round(ease * 10) / 10,
    grade: Math.max(0, Math.round(grade * 10) / 10),
    label,
    longSentences: sentences.filter(s => s.split(/\s+/).length > 25).length,
  };
}
