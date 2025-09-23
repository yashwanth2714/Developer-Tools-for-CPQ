const vscode = require("vscode");

class BMLSignatureHelpProvider {
    constructor(docs) {
        this.docs = docs;
    }

    provideSignatureHelp(document, position) {
        const line = document.lineAt(position.line).text;
        const funcMatch = line.slice(0, position.character).match(/([A-Za-z_][A-Za-z0-9_]*)\s*\([^()]*$/);
        if (!funcMatch) return null;

        const funcName = funcMatch[1].toLowerCase();
        if (!this.docs[funcName]) return null;

        const signatureInfo = new vscode.SignatureInformation(this.docs[funcName].signature);

        // Split args for parameter hints
        const argsMatch = this.docs[funcName].signature.match(/\(([^)]*)\)/);
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
}

module.exports = BMLSignatureHelpProvider;