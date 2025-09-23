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
        view.webview.html = this.getHtml();

        // Listen for search queries from the webview
        view.webview.onDidReceiveMessage((message) => {
            if (message.type === "search") {
                const filtered = this.filterSnippets(message.query);
                // Send only results back, don't reload entire HTML
                view.webview.postMessage({ type: "updateResults", snippets: filtered });
            }
        });
    }

    filterSnippets(query) {
        if (!query) return this.snippets;
        const result = {};
        for (const [key, snip] of Object.entries(this.snippets)) {
            if (
                key.toLowerCase().includes(query.toLowerCase())
                || (snip.prefix &&
                    snip.prefix.toLowerCase().includes(query.toLowerCase()))
            ) {
                result[key] = snip;
            }
        }
        return result;
    }

    // Initial HTML loads search box + placeholder for results
    getHtml() {
        return `
      <html>
      <body style="font-family:sans-serif;padding:0.5em;">
        <input id="searchBox" type="text" placeholder="Search BML functions..."
          style="width:100%;padding:6px;font-size:13px;"/>
        <div id="results"></div>

        <script>
          const vscode = acquireVsCodeApi();
          const searchBox = document.getElementById('searchBox');
          const resultsDiv = document.getElementById('results');

          searchBox.addEventListener('input', e => {
            vscode.postMessage({ type: 'search', query: e.target.value });
          });

          // Handle updates from extension
          window.addEventListener('message', event => {
            const msg = event.data;
            if (msg.type === 'updateResults') {
              const snippets = msg.snippets;
              let html = "";
              const categories = {};

              for (const key in snippets) {
                let snip = snippets[key];
                let cat = snip.category;
                let funcName = snip.functionName;

                if (!categories[cat]) categories[cat] = [];
                categories[cat].push({ funcName, snip });
              }

              for (const cat in categories) {
                html += "<h3>" + cat + "</h3><ul>";
                for (const item of categories[cat]) {
                  const { funcName, snip } = item
                 html += \`
                    <li style="margin-bottom:20px;">
                      <div style="margin-bottom:0px;font-weight:bold">\${funcName}</div><br/>
                      <code style="padding-top:5px;padding-bottom:5px">\${snip.signature || ""}</code><br/>
                      <div style="font-size:13px;color:rgb(182, 179, 179);margin-top:10px">
                        \${snip.description || ""}
                      </div>
                    </li>
                  \`;
                }
                html += "</ul>";
              }

              resultsDiv.innerHTML = html;
            }
          });

          // Initial load with all snippets
          vscode.postMessage({ type: 'search', query: '' });
        </script>
      </body>
      </html>
    `;
    }
}

module.exports = CPQDocsViewProvider;