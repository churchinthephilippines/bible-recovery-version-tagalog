import books from "@/assets/bible"
import formatBookName from "./formatBookName";

const getFootnoteInfo = (current: { point?: string, id: string, book: string; chapter: number }) => {
  // @ts-ignore
  const chapter = books[current.book]?.[`chapter-${current.chapter}`]
  if(!chapter) return null
  const verse = current.id.split('-')[0]
  const foundVerse = chapter.verses[parseInt(verse) - 1]?.footnotes.find((item: Record<'id' | 'word', string>) => item.id === current.id) as Record<'id' | 'word', string>

  const foundFootnote = chapter.footnoteReferences.find((ref: Record<'id' | 'text', string>) => ref.id === current.id) as Record<'id' | 'text', string>

  if(foundFootnote) {
    return {
      foundTitle: `Tala sa ${current.book} ${current.chapter}:${current.id.split('-')[0]}, "${foundVerse.word.replace(/[\,\;\)\:]/g, '')}"${current.point ? `, ${current.point.replace(',', '')}` : ''}:`,
      foundFootnote: foundFootnote.text
    }
  }
}

const extractFootnoteLink = (footnote: string, current: { book: string; chapter: number }, indexing: Array<{book: string; chapter: number, id: string}> = []): string => {
  const regexp = /\(?(?:Tingnan|Tignan|tingnan)\s(?:ang|sa)\stala\s(\d+-\d+)\s?,?(\s(?:punto|talata|tal.)\s\d+,?)?(?:(?:\s?sa\s(\d*\s?[a-zA-Z\.]+?)\s(\d+))|(?:\s?sa\s(kap\.|kapitulo)\s(\d+)))?\.?\)?\.?/
  const [foundLink, id, point, book, chapter] = footnote.match(regexp) || []

  const repeatedAction = (newCurrent: { book: string; chapter: number}) => {
    if(indexing.some((item) => 
      item.book === newCurrent.book 
      && item.chapter.toString() === newCurrent.chapter.toString()
      && item.id === id
    )) {
      return footnote.replace(regexp, '').trim()
    }

    const info = getFootnoteInfo({ point, id, ...newCurrent })

    if(info) return extractFootnoteLink(
      footnote.replace(regexp, `\n\n${info.foundTitle}\n\n${extractFootnoteLink(info.foundFootnote, newCurrent, [...indexing, { ...newCurrent, id }])}\n\n`).trim(),
      newCurrent, 
      [...indexing, { ...newCurrent, id }]
    )

    return footnote
  }

  if(foundLink) {
    if(book?.startsWith('kap') && chapter) {
      const newCurrent = { book: formatBookName(current.book), chapter: parseInt(chapter) }

      return repeatedAction(newCurrent)
    }

    if(book && chapter) {
      const newCurrent = { book: formatBookName(book), chapter: parseInt(chapter) }

      return repeatedAction(newCurrent)
    }

    if(id) {
      const newCurrent = { book: formatBookName(current.book), chapter: current.chapter }

      return repeatedAction(newCurrent)
    }
  }

  return footnote
}

export default extractFootnoteLink