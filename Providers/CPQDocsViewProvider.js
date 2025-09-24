const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

class CPQDocsViewProvider {
    constructor(extensionPath) {
        this.extensionPath = extensionPath;
        const snippetsPath = path.join(this.extensionPath, "snippets/snippets.json");
        this.snippets = JSON.parse(fs.readFileSync(snippetsPath, "utf8"));
    }

    insertSnippet(snippetText) {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage("No active editor to insert snippet.");
            return;
        }

        const position = editor.selection.active;

        // Get editor settings
        const { insertSpaces, tabSize } = editor.options;
        let indentUnit = insertSpaces ? " ".repeat(tabSize) : "\t";

        // Get current line’s leading whitespace
        const lineText = editor.document.lineAt(position.line).text;
        const currentIndentMatch = lineText.match(/^\s*/);
        const currentIndent = currentIndentMatch ? currentIndentMatch[0] : "";

        // Apply indentation for multiline snippets
        const indentedSnippet = snippetText
            .split("\n")
            .map((line, idx) => (idx === 0 ? line : currentIndent + line))
            .join("\n");

        editor.edit(editBuilder => {
            editBuilder.insert(position, indentedSnippet);
        });

        vscode.window.showInformationMessage("✅ Snippet inserted into editor");
    }


    resolveWebviewView(view) {
        view.webview.options = { enableScripts: true };

        const htmlPath = path.join(this.extensionPath, "Providers/CPQDocs.html");
        let html = fs.readFileSync(htmlPath, "utf8");

        view.webview.html = html;

        view.webview.onDidReceiveMessage((message) => {
            if (message.type === "search") {
                const filtered = this.filterSnippets(message.query);
                const htmlResults = this.buildResults(filtered);
                view.webview.postMessage({ type: "updateResults", html: htmlResults });
            } else if (message.type === "insertSnippet") {
                this.insertSnippet(message.snippet);

            } else if (message.type === "info") {
                vscode.window.showInformationMessage(message.message);
            }
        });

    }

    filterSnippets(query) {
        if (!query) return this.snippets;
        const result = {};
        for (const [key, snip] of Object.entries(this.snippets)) {
            if (
                key.toLowerCase().includes(query.toLowerCase()) ||
                (snip.prefix && snip.prefix.toLowerCase().includes(query.toLowerCase())) ||
                (snip.category && snip.category.toLowerCase().includes(query.toLowerCase()))
            ) {
                result[key] = snip;
            }
        }
        return result;
    }

    buildResults(snippets) {
        const categories = {};
        for (const key in snippets) {
            const snip = snippets[key];
            const body = Array.isArray(snip.body) ? snip.body.join("\n") : (snip.body || "");
            const safeBody = body.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            const escapedForAttr = body
                .replace(/"/g, "&quot;")
                .replace(/`/g, "\\`")
                .replace(/\\/g, "\\\\");

            const cat = snip.category || "Other";
            const funcName = snip.functionName || key;
            if (!categories[cat]) categories[cat] = [];
            categories[cat].push({ funcName, snip, safeBody, escapedForAttr });
        }

        let html = "";
        for (const cat in categories) {
            html += `<h3 class="category">${cat}</h3><div>`;
            for (const { funcName, snip, safeBody, escapedForAttr } of categories[cat]) {
                html += `
                <div class="list-item">
                    <div class="functionName">${funcName}</div>
                    <code>${snip.signature || ""}</code>
                    <div class="description">
                    ${snip.description || ""}
                    </div>
                    <pre>${safeBody}</pre>
                    <button class="copy-btn" data-snippet="${escapedForAttr}">Copy</button>
                    <button class="insert-btn" data-snippet="${escapedForAttr}">Insert</button>
                </div>
                `;
            }
            html += `</div>`;
        }
        return html;
    }
}

module.exports = CPQDocsViewProvider;
