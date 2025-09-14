const vscode = require("vscode");
const beautify = require("js-beautify").js;

function activate(context) {
    vscode.languages.registerDocumentFormattingEditProvider("bml", {
        provideDocumentFormattingEdits(document) {
            const text = document.getText();

            // Replace AND/OR with JS equivalents
            let bmlCode = text.replace(/\bAND\b/g, "&&").replace(/\bOR\b/g, "||");

            const options = {
                indent_size: 4,
                indent_with_tabs: false,
                brace_style: "collapse",
                end_with_newline: true,
                space_in_empty_paren: false,
                wrap_line_length: 0
            };

            let formatted = beautify(bmlCode, options);

            // Revert AND/OR
            formatted = formatted.replace(/\&\&/g, "AND").replace(/\|\|/g, "OR");

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

function deactivate() { }

module.exports = { activate, deactivate };
