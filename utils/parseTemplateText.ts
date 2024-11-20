const parseTemplateText = (input: string) => {
  const regex = /\[(\/?)(b|i|h)\]/g; // Matches opening/closing tags like [b], [/b], etc.
  let stack = [];
  let lastIndex = 0;
  const result = [];

  while (true) {
    const match = regex.exec(input);

    if (!match) {
      // Add remaining text if any
      if (lastIndex < input.length) {
        result.push({
          content: input.slice(lastIndex),
          styles: [...stack],
        });
      }
      break;
    }

    if (match.index > lastIndex) {
      // Add text between tags
      result.push({
        content: input.slice(lastIndex, match.index),
        styles: [...stack],
      });
    }

    if (match[1] === "/") {
      // Closing tag - remove from stack
      stack.pop();
    } else {
      // Opening tag - add to stack
      stack.push(match[2]);
    }

    lastIndex = regex.lastIndex;
  }

  return result;
};

export default parseTemplateText