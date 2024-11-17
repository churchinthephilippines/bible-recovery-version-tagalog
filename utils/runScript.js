function extractChapterContent(chapter) {
    const verses = Array.from(document.querySelectorAll("p[id]")).map(p => {
        const id = p.id;
        const footnotes = Array.from(p.querySelectorAll(".fnlink")).map(anchor => {
            anchor.querySelectorAll("sup").forEach(sup => sup.remove());
            const word = anchor.textContent?.replace(/[0-9]+/g, " ").trim();
            const id = anchor.href.split("#").at(-1).trim();
            return { word, id };
        });
        const text = p.textContent?.replace(/[0-9]+/g, " ").trim();
        const outlineElement = p.parentElement?.previousElementSibling
        let outlines = null
    
        if(outlineElement && !outlineElement?.matches("[data-scanned='true']")) {
            outlineElement.setAttribute("data-scanned", "true");
            outlines = Array.from(outlineElement.querySelectorAll("h3")).map(p => p.innerHTML.replaceAll("<br>", "\n").trim());
        }
    
        return { id, text, footnotes, outlines };
    });

    return {
        chapter,
        verses,
        footnoteReferences: []
    }
}

function extractChapterFootnoteReferences() {

    return Array.from(document.querySelectorAll("a[id].vlink")).map(a => {
        const id = a.id.trim();
        a.nextElementSibling.innerHTML = a.nextElementSibling.innerHTML.replace(/([0-9]+)\s*?(<sup>)/g, "$1$2").replace(/<sup>\s*?([0-9]+)\s*?<\/sup>/g, "-$1");
        const text = a.nextElementSibling.textContent.replaceAll("\n", " ").replace(/\s+/g, ' ').trim();
    
        return { id, text };
    })
}