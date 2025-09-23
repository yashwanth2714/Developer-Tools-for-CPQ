const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

class CPQDocsViewProvider {
    constructor(extensionPath) {
        this.extensionPath = extensionPath;
        const snippetsPath = path.join(this.extensionPath, "snippets/snippets.json");
        this.snippets = JSON.parse(fs.readFileSync(snippetsPath, "utf8"));
    }

    resolveWebviewView(view) {
        view.webview.options = { enableScripts: true };

        const htmlPath = path.join(this.extensionPath, "Providers/CPQDocs.html");
        console.log(htmlPath)
        let html = fs.readFileSync(htmlPath, "utf8");

        view.webview.html = html;

        view.webview.onDidReceiveMessage((message) => {
            if (message.type === "search") {
                const filtered = this.filterSnippets(message.query);
                const htmlResults = this.buildResults(filtered);
                view.webview.postMessage({ type: "updateResults", html: htmlResults });
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
                (snip.description && snip.description.toLowerCase().includes(query.toLowerCase()))
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
            html += `<h3>${cat}</h3><ul>`;
            for (const { funcName, snip, safeBody, escapedForAttr } of categories[cat]) {
                html += `
          <li>
            <div style="font-weight:bold;font-size:14px;">${funcName}</div>
            <code>${snip.signature || ""}</code>
            <div style="font-size:13px;color:rgb(182, 179, 179);margin:8px 0;">
              ${snip.description || ""}
            </div>
            <pre>${safeBody}</pre>
            <button class="copy-btn" data-snippet="${escapedForAttr}">📋 Copy Snippet</button>
          </li>
        `;
            }
            html += `</ul>`;
        }
        return html;
    }
}

module.exports = CPQDocsViewProvider;
