const correctShortName = (bookName: string) => {
  switch(bookName) {
    case 'Mat.': return 'Mateo'
    case 'Mar.': return 'Marcos'
    case 'Luc.': return 'Lucas'
    case '1 Cor.': return '1 Corinto'
    case '2 Cor.': return '2 Corinto'
    case 'Gal.': return 'Galacia'
    case 'Efe.': return 'Efeso'
    case 'Fil.': return 'Filipos'
    case 'Col.': return 'Colosas'
    case '1 Tes.': return '1 Tesalonica'
    case '2 Tes.': return '1 Tesalonica'
    case '1 Tim.': return '1 Timoteo'
    case '2 Tim.': return '2 Timoteo'
    case 'Heb.': return 'Hebreo'
    case 'Sant.': return 'Santiago'
    case '1 Ped.': return '1 Pedro'
    case '2 Ped.': return '2 Pedro'
    case 'Jud.': return 'Judas'
    case 'Apoc.': return 'Apocalipsis'
    case 'Mat': return 'Mateo'
    case 'Mar': return 'Marcos'
    case 'Luc': return 'Lucas'
    case '1 Cor': return '1 Corinto'
    case '2 Cor': return '2 Corinto'
    case 'Gal': return 'Galacia'
    case 'Efe': return 'Efeso'
    case 'Fil': return 'Filipos'
    case 'Col': return 'Colosas'
    case '1 Tes': return '1 Tesalonica'
    case '2 Tes': return '1 Tesalonica'
    case '1 Tim': return '1 Timoteo'
    case '2 Tim': return '2 Timoteo'
    case 'Heb': return 'Hebreo'
    case 'Sant': return 'Santiago'
    case '1 Ped': return '1 Pedro'
    case '2 Ped': return '2 Pedro'
    case 'Jud': return 'Judas'
    case 'Apoc': return 'Apocalipsis'
    default: return bookName
  }
}

const formatBookName = (bookName: string) => correctShortName(bookName).toLowerCase().replace(/\s+/g, '-')

export default formatBookName