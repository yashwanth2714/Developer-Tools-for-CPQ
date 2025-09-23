const vscode = require("vscode");

class BMLHoverProvider {
    constructor(docs) {
        this.docs = docs;
    }

    provideHover(document, position) {
        const range = document.getWordRangeAtPosition(position, /[A-Za-z_][A-Za-z0-9_]*/);
        if (!range) return;

        const word = document.getText(range).toLowerCase();
        if (this.docs[word]) {
            const md = new vscode.MarkdownString(
                `${this.docs[word].desc}\n\n\`\`\`bml\n${this.docs[word].body}\n\`\`\``
            );
            return new vscode.Hover(md);
        }
    }
}

module.exports = BMLHoverProvider;