const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const beautify = require("js-beautify").js;

// Load all snippets from your snippets JSON file
function loadSnippets(context) {
    const snippetsPath = path.join(context.extensionPath, "snippets", "snippets.code-snippets");
    const raw = fs.readFileSync(snippetsPath, "utf8");
    const snippets = JSON.parse(raw);

    const docs = {};
    for (const snippet of Object.values(snippets)) {
        if (snippet.prefix) {
            // Extract last part after "-"
            const parts = snippet.prefix.split("-");
            const funcName = parts[parts.length - 1].toLowerCase();
            const desc = snippet.description || "No description available.";
            const body = Array.isArray(snippet.body)
                ? snippet.body.join("\n")
                : snippet.body;

            docs[funcName] = desc + "\n\n```bml\n" + body + "\n```";
        }
    }
    return docs;
}

function activate(context) {
    vscode.languages.registerDocumentFormattingEditProvider("bml", {
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

    const docs = loadSnippets(context);

    // Register HoverProvider
    context.subscriptions.push(
        vscode.languages.registerHoverProvider("bml", {
            provideHover(document, position) {
                const range = document.getWordRangeAtPosition(position, /[A-Za-z_][A-Za-z0-9_]*/);
                if (!range) return;

                const word = document.getText(range).toLowerCase();
                if (docs[word]) {
                    return new vscode.Hover(new vscode.MarkdownString(docs[word]));
                }
            }
        })
    );
}

function deactivate() { }

module.exports = { activate, deactivate };
