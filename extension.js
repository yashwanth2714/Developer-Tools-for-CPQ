const vscode = require("vscode");
const beautify = require("js-beautify").js; // Use the "js" mode (close to BML style)

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    vscode.languages.registerDocumentFormattingEditProvider("bml", {
        provideDocumentFormattingEdits(document) {
            const text = document.getText();

            // Configure js-beautify
            const options = {
                indent_size: 4,
                indent_with_tabs: false,
                brace_style: "collapse,preserve-inline",
                end_with_newline: true,
                space_in_empty_paren: false
            };

            const formatted = beautify(text, options);

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
