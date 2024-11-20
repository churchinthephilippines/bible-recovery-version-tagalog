import { StyleSheet } from "react-native";
import parseTemplateText from "@/utils/parseTemplateText";
import { ThemedText, ThemedTextProps } from "./ThemedText";

type ThemedTemplatedTextProps = Omit<ThemedTextProps, 'children'> & {
  children: string;
};

export function ThemedTemplatedText({children, ...props}: ThemedTemplatedTextProps) {

  const parsedText = parseTemplateText(children);

  return (
    <ThemedText {...props}>
      {parsedText.map((part, index) => (
        <ThemedText key={index} {...props} style={getStyles(part.styles, props.style)}>
          {part.content}
        </ThemedText>
      ))}
    </ThemedText>
  );
};

// Helper function to determine styles dynamically
const getStyles = (stylesArray: string[], defaultStyles?: ThemedTextProps['style']) => {
  const styles: ThemedTextProps['style'] = [defaultStyles];
  if (stylesArray.includes("b")) styles.push(stylesheet.bold);
  if (stylesArray.includes("i")) styles.push(stylesheet.italic);
  if (stylesArray.includes("h"))
    styles.push(stylesheet.highlight);

  return styles.flat();
};

const stylesheet = StyleSheet.create({
  bold: {
    fontWeight: "bold",
  },
  italic: {
    fontStyle: "italic",
  },
  highlight: {
    backgroundColor: "yellow",
    color: "black",
  },
});

export default ThemedTemplatedText;