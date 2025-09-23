const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const beautify = require("js-beautify").js;

// Load all snippets from your snippets JSON file
function loadSnippets(context) {
    const snippetsPath = path.join(context.extensionPath, "snippets", "snippets.json");
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

            // // Try to extract signature from body (everything before first ")")
            // const sigMatch = body.match(/^([^(]+)\((.*)\)/);
            // const signature = sigMatch ? sigMatch[1] + "(" + sigMatch[2] + ")" : body;

            docs[funcName] = { desc, body, signature: snippet.signature };
        }
    }
    return docs;
}

function activate(context) {
    // Register a DocumentFormattingEditProvider for BML files
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
                    const md = new vscode.MarkdownString(
                        `${docs[word].desc}\n\n\`\`\`bml\n${docs[word].body}\n\`\`\``
                    );
                    return new vscode.Hover(md);
                }
            }
        })
    );

    // Signature help provider
    context.subscriptions.push(
        vscode.languages.registerSignatureHelpProvider("bml", {
            provideSignatureHelp(document, position) {
                const line = document.lineAt(position.line).text;
                const funcMatch = line.slice(0, position.character).match(/([A-Za-z_][A-Za-z0-9_]*)\s*\([^()]*$/);
                if (!funcMatch) return null;

                const funcName = funcMatch[1].toLowerCase();
                if (!docs[funcName]) return null;

                const signatureInfo = new vscode.SignatureInformation(docs[funcName].signature);

                // Split args for parameter hints
                const argsMatch = docs[funcName].signature.match(/\(([^)]*)\)/);
                if (argsMatch) {
                    const args = argsMatch[1].split(",").map(a => a.trim()).filter(Boolean);
                    args.forEach(arg => {
                        signatureInfo.parameters.push(new vscode.ParameterInformation(arg));
                    });
                }

                const sigHelp = new vscode.SignatureHelp();
                sigHelp.signatures = [signatureInfo];
                sigHelp.activeSignature = 0;

                // Count commas to find active parameter index
                const beforeCursor = line.slice(line.indexOf("("), position.character);
                sigHelp.activeParameter = (beforeCursor.match(/,/g) || []).length;

                return sigHelp;
            }
        }, "(", ",") // triggers
    );

    // context.subscriptions.push(
    //     vscode.languages.registerCompletionItemProvider("bml", {
    //         provideCompletionItems() {
    //             console.log("provideCompletionItems")
    //             console.log(docs);
    //             console.log(docs.length);
    //             console.log(Object.entries(docs));
    //             const completions = [];

    //             for (const [label, snip] of Object.entries(docs)) {
    //                 // docs keys are already like "jsonget", "len", etc.
    //                 const funcName = label.toLowerCase();

    //                 if (funcName.startsWith("bml-")) continue;

    //                 const item = new vscode.CompletionItem(funcName, vscode.CompletionItemKind.Function);

    //                 if (Array.isArray(snip.body)) {
    //                     item.insertText = new vscode.SnippetString(snip.body.join("\n"));
    //                 } else if (typeof snip.body === "string") {
    //                     item.insertText = new vscode.SnippetString(snip.body);
    //                 }

    //                 item.detail = snip.signature || funcName;

    //                 const doc = new vscode.MarkdownString();
    //                 if (snip.desc) doc.appendMarkdown(`**Description:** ${snip.desc}\n\n`);
    //                 if (snip.signature) doc.appendMarkdown(`**Signature:** \`${snip.signature}\`\n`);
    //                 item.documentation = doc;

    //                 completions.push(item);
    //             }
    //             console.log(completions)
    //             return completions;
    //         },
    //     },
    //         ...'abcdefghijklmnopqrstuvwxyz'.split('')
    //     )

    // );

}

function deactivate() { }

module.exports = { activate, deactivate };
