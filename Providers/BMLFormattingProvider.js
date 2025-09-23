const beautify = require("js-beautify").js;
const vscode = require("vscode");

class BMLFormattingProvider {
    static register() {
        return vscode.languages.registerDocumentFormattingEditProvider("bml", {
            provideDocumentFormattingEdits(document) {
                let text = document.getText();

                // Replace elif → else if (before beautify)
                text = text.replace(/\belif\s*\(/gi, "else if(");

                // Replace AND/OR only inside conditions
                text = text.replace(
                    /(if|else if|while|for)\s*\(([^)]*)\)/gi,
                    (match, keyword, condition) => {
                        const replaced = condition
                            .replace(/\bAND\b/gi, "&&")
                            .replace(/\bOR\b/gi, "||");
                        return `${keyword}(${replaced})`;
                    }
                );

                const options = {
                    indent_size: 4,
                    indent_with_tabs: false,
                    brace_style: "collapse",
                    end_with_newline: true,
                    space_in_empty_paren: false,
                    wrap_line_length: 0
                };

                let formatted = beautify(text, options);

                // Restore keywords
                formatted = formatted
                    .replace(/\belse if\s*\(/g, "elif (")   // back to elif
                    .replace(/\&\&/g, "AND")               // back to AND
                    .replace(/\|\|/g, "OR");               // back to OR

                // Fix not-equal operator
                formatted = formatted.replace(/<\s*>/g, "<>");

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