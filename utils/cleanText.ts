function cleanText(text: string) {
  // Remove special characters, keeping only alphanumeric characters and spaces
  return text.replace(/[^a-zA-Z0-9\s]/g, '');
}

export default cleanText