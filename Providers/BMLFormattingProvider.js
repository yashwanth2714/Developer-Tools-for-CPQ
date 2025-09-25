const beautify = require("js-beautify").js;
const vscode = require("vscode");

class BMLFormattingProvider {
    static register() {
        return vscode.languages.registerDocumentFormattingEditProvider(["bml", "plaintext", "c", "java"], {
            provideDocumentFormattingEdits(document) {
                let text = document.getText();

                //
                // 1. PREPROCESS – make BML look like valid JS
                //

                // for line in array {  →  for (let line of array) {
                text = text.replace(
                    /\bfor\s+(\w+)\s+in\s+([^{\n]+)\{/g,
                    "for (let $1 of $2){"
                );

                // elif (cond) → else if(cond)
                text = text.replace(/\belif\s*\(/gi, "else if(");

                // Replace AND/OR only inside conditions
                text = text.replace(
                    /(if|else if|while)\s*\(([^)]*)\)/gi,
                    (match, keyword, condition) => {
                        const replaced = condition
                            .replace(/\bAND\b/gi, "&&")
                            .replace(/\bOR\b/gi, "||")
                            .replace(/<\s*>/g, "!="); // <> → !=
                        return `${keyword}(${replaced})`;
                    }
                );

                //
                // 2. BEAUTIFY
                //
                const options = {
                    indent_size: 4,
                    indent_with_tabs: false,
                    brace_style: "collapse",
                    end_with_newline: true,
                    space_in_empty_paren: false,
                    wrap_line_length: 0,
                    preserve_newlines: true,
                    unindent_chained_methods: true
                };

                let formatted = beautify(text, options);

                //
                // 3. POSTPROCESS – restore BML syntax
                //

                // Restore for loops
                formatted = formatted.replace(
                    /\bfor\s*\(let\s+(\w+)\s+of\s+([^)]+)\)/g,
                    "for $1 in $2"
                );

                // Restore elif
                formatted = formatted.replace(/\belse if\s*\(/g, "elif (");

                // Restore AND/OR
                formatted = formatted.replace(/\&\&/g, "AND");
                formatted = formatted.replace(/\|\|/g, "OR");

                // Restore not equal
                formatted = formatted.replace(/!=/g, "<>");

                //
                // 4. Replace document
                //
                const fullRange = new vscode.Range(
                    document.positionAt(0),
                    document.positionAt(text.length)
                );

                return [vscode.TextEdit.replace(fullRange, formatted)];
            }
        });
    }
}

module.exports = BMLFormattingProvider;
