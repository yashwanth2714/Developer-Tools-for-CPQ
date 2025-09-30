const vscode = require("vscode");

class BMLDiagnosticsProvider {
    static register(context) {
        const collection = vscode.languages.createDiagnosticCollection("bml");
        context.subscriptions.push(collection);

        // Run on file open/change
        vscode.workspace.onDidOpenTextDocument(doc => this.checkDocument(doc, collection));
        vscode.workspace.onDidChangeTextDocument(e => this.checkDocument(e.document, collection));
        vscode.workspace.onDidSaveTextDocument(doc => this.checkDocument(doc, collection));

        // Initial scan
        vscode.workspace.textDocuments.forEach(doc => this.checkDocument(doc, collection));
    }

    static checkDocument(document, collection) {
        if (document.languageId !== "bml") return;

        const text = document.getText();
        const diagnostics = [];

        //
        // Rule 1: Hardcoded Values (e.g., "12345", "ABC001")
        //
        // const hardcodedRegex = /"([A-Z0-9]{3,})"/g;
        // let match;
        // while ((match = hardcodedRegex.exec(text))) {
        //     const start = document.positionAt(match.index);
        //     const end = document.positionAt(match.index + match[0].length);
        //     diagnostics.push(new vscode.Diagnostic(
        //         new vscode.Range(start, end),
        //         `Hardcoded value "${match[1]}" detected. Consider using attributes or variables instead.`,
        //         vscode.DiagnosticSeverity.Warning
        //     ));
        // }

        //
        // Rule 2: Unused Variables (naive detection: declared but not used again)
        //
        const varRegex = /\b(\w+)\s*=/g; // find variable assignments
        let varMatch;
        const declaredVars = [];
        while ((varMatch = varRegex.exec(text))) {
            declaredVars.push({ name: varMatch[1], index: varMatch.index });
        }

        declaredVars.forEach(v => {
            const usageRegex = new RegExp(`\\b${v.name}\\b`, "g");
            let count = 0, m;
            while ((m = usageRegex.exec(text))) count++;
            if (count <= 1) { // only declared, never used elsewhere
                const start = document.positionAt(v.index);
                const end = document.positionAt(v.index + v.name.length);
                diagnostics.push(new vscode.Diagnostic(
                    new vscode.Range(start, end),
                    `Variable "${v.name}" is declared but never used.`,
                    vscode.DiagnosticSeverity.Information
                ));
            }
        });

        //
        // Rule 3: Missing Null Checks (dictionaryget/jsonpathgetsingle without isnull)
        //
        // const riskyCalls = /(dictionaryget|jsonpathgetsingle)\s*\(/g;
        // while ((match = riskyCalls.exec(text))) {
        //     const snippetBefore = text.substring(Math.max(0, match.index - 50), match.index);
        //     if (!/isnull\s*\(/.test(snippetBefore)) { // no isnull check near it
        //         const start = document.positionAt(match.index);
        //         const end = document.positionAt(match.index + match[0].length);
        //         diagnostics.push(new vscode.Diagnostic(
        //             new vscode.Range(start, end),
        //             `${match[1]} used without an isnull() check.`,
        //             vscode.DiagnosticSeverity.Error
        //         ));
        //     }
        // }

        //
        // Rule 4: Empty Blocks
        //
        // const emptyBlockRegex = /\{\s*\}/g;
        // while ((match = emptyBlockRegex.exec(text))) {
        //     const start = document.positionAt(match.index);
        //     const end = document.positionAt(match.index + match[0].length);
        //     diagnostics.push(new vscode.Diagnostic(
        //         new vscode.Range(start, end),
        //         "Empty block detected. Consider removing or adding logic.",
        //         vscode.DiagnosticSeverity.Hint
        //     ));
        // }

        // Push all collected diagnostics
        collection.set(document.uri, diagnostics);
    }
}

module.exports = BMLDiagnosticsProvider;
