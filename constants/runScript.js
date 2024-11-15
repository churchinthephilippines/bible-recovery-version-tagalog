function runScript(chapter) {
    const verses = Array.from(document.querySelectorAll("p[id]")).map(p => {
        const id = p.id;
        const footnotes = Array.from(p.querySelectorAll(".fnlink")).map(span => {
            span.querySelectorAll("sup").forEach(sup => sup.remove());
            const word = span.textContent?.replace(/[0-9]+/g, " ").trim();
            const note = "";
            return { word, note };
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
        verses
    }
}