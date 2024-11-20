const wrapWordWithTemplate = (input: string, word: string, template: string) => {
  const escapedWord = word.replace(/[.*+?^${}()|[\]\\,]/g, "\\$&"); // Escape special characters in the word
  const regex = new RegExp(`\\b${escapedWord}\\b`, "g"); // Match whole words only
  return input.replace(regex, `[${template}]${word}[/${template}]`);
};

export default wrapWordWithTemplate