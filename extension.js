
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const CPQDocsViewProvider = require("./Providers/CPQDocsViewProvider");
const BMLFormattingProvider = require("./Providers/BMLFormattingProvider");
const BMLHoverProvider = require("./Providers/BMLHoverProvider");
const BMLSignatureHelpProvider = require("./Providers/BMLSignatureHelpProvider");

// Load all snippets from your snippets JSON file
function loadSnippets(context) {
    const snippetsPath = path.join(context.extensionPath, "snippets", "snippets.json");
    const raw = fs.readFileSync(snippetsPath, "utf8");
    const snippets = JSON.parse(raw);

    const docs = {};
    for (const snippet of Object.values(snippets)) {
        if (snippet.prefix) {
            const funcName = snippet.functionName;
            const desc = snippet.description || "No description available.";
            const body = Array.isArray(snippet.body)
                ? snippet.body.join("\n")
                : snippet.body;
            docs[funcName] = { desc, body, signature: snippet.signature };
        }
    }
    return docs;
}

function activate(context) {
    // Register CPQDocsViewProvider
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider("cpqDocs", new CPQDocsViewProvider(context.extensionPath))
    );

    // Register BMLFormattingProvider
    context.subscriptions.push(BMLFormattingProvider.register());

    const docs = loadSnippets(context);

    // Register HoverProvider
    context.subscriptions.push(
        vscode.languages.registerHoverProvider(["bml", "plaintext", "c", "java"], new BMLHoverProvider(docs))
    );

    // Register SignatureHelpProvider
    context.subscriptions.push(
        vscode.languages.registerSignatureHelpProvider(
            ["bml", "plaintext", "c", "java"],
            new BMLSignatureHelpProvider(docs),
            "(", ","
        )
    );
}

function deactivate() { }

module.exports = { activate, deactivate };
