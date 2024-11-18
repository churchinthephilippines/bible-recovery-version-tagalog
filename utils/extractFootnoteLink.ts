import books from "@/assets/bible"
import formatBookName from "./formatBookName";

const format = (footnote: string, current: { regexpUsed: RegExp, point?: string, id: string, book: string; chapter: number | string }) => {
  // @ts-ignore
  const chapter = books[formatBookName(current.book)]?.[`chapter-${current.chapter}`]
  if(!chapter) return footnote;

  const verse = current.id.split('-')[0]
  const foundVerse = chapter.verses[parseInt(verse) - 1].footnotes.find((item: Record<'id' | 'word', string>) => item.id === current.id) as Record<'id' | 'word', string>
  const foundFootnote = chapter.footnoteReferences.find((ref: Record<'id' | 'text', string>) => ref.id === current.id) as Record<'id' | 'text', string>

  if(foundFootnote) {
    return footnote.replace(current.regexpUsed, `\n\nTala sa ${current.book} ${current.chapter}:${current.id.split('-')[0]}, "${foundVerse.word.replace(',', '').replace(';', '')}"${current.point ? `, ${current.point.replace(',', '')}` : ''}:\n\n${extractFootnoteLink(foundFootnote.text, { book: current.book, chapter: current.chapter })}\n\n`)
  }
}

const extractFootnoteLink = (footnote: string, current: { book: string; chapter: number | string }): string => {
  const regexp = /\(?(?:Tingnan|Tignan|tingnan)\s(?:ang|sa)\stala\s(\d+?-\d+?)\s?,?(\s(?:punto|talata|tal.)\s\d+?,?)?(?:(?:\s?sa\s(\d*?\s?[a-zA-Z\.]+?)\s(\d+?))|(?:\s?sa\s(kap\.|kapitulo)\s(\d+?)))?\.?\)?\.?/
  const [foundLink, id, point, book, chapter] = footnote.match(regexp) || []

  if(foundLink) {
    if(book?.startsWith('kap') && chapter) {
      const formatted = format(footnote, { regexpUsed: regexp, point, id, book: current.book, chapter })

      if(formatted) return formatted.trim()
    }

    if(book && chapter) {
      const formatted = format(footnote, { regexpUsed: regexp, point, id, book, chapter })

      if(formatted) return formatted.trim()
    }

    if(id) {
      const formatted = format(footnote, { regexpUsed: regexp, point, id, ...current })

      if(formatted) return formatted.trim()
    }
  }

  return footnote.trim()
}

export default extractFootnoteLink