const beautify = require("js-beautify").js;
const vscode = require("vscode");

class BMLFormattingProvider {
    static register() {
        return vscode.languages.registerDocumentFormattingEditProvider(["bml", "plaintext", "c", "java"], {
            provideDocumentFormattingEdits(document) {
                let text = document.getText();

                //
                // 1. PREPROCESS – make BML look like valid JS
                //

                // for line in array {  →  for (let line of array) {
                text = text.replace(
                    /\bfor\s+(\w+)\s+in\s+([^{\n]+)\{/g,
                    "for (let $1 of $2){"
                );

                // elif (cond) → else if(cond)
                text = text.replace(/\belif\s*\(/gi, "else if(");


                // Replace AND/OR and <> only inside conditions (if, else if, while) with balanced parentheses
                function replaceInConditions(str) {
                    const keywords = ["if", "else if", "while"];
                    let result = '';
                    let i = 0;
                    while (i < str.length) {
                        let matched = false;
                        for (const keyword of keywords) {
                            if (str.slice(i).toLowerCase().startsWith(keyword)) {
                                let j = i + keyword.length;
                                // Skip whitespace
                                while (j < str.length && /\s/.test(str[j])) j++;
                                if (str[j] === '(') {
                                    // Find matching parenthesis
                                    let start = j;
                                    let depth = 0;
                                    let end = -1;
                                    for (let k = j; k < str.length; k++) {
                                        if (str[k] === '(') depth++;
                                        else if (str[k] === ')') depth--;
                                        if (depth === 0) {
                                            end = k;
                                            break;
                                        }
                                    }
                                    if (end !== -1) {
                                        // Replace inside the condition
                                        let condition = str.slice(start + 1, end);
                                        let replaced = condition
                                            .replace(/<>/g, "__BML_NOT_EQUAL__")
                                            .replace(/\bAND\b/gi, "&&")
                                            .replace(/\bOR\b/gi, "||");
                                        result += str.slice(i, start + 1) + replaced + ')';
                                        i = end + 1;
                                        matched = true;
                                        break;
                                    }
                                }
                            }
                        }
                        if (!matched) {
                            result += str[i];
                            i++;
                        }
                    }
                    return result;
                }
                text = replaceInConditions(text);

                //
                // 2. BEAUTIFY
                //
                const options = {
                    indent_size: 4,
                    indent_with_tabs: false,
                    brace_style: "collapse",
                    end_with_newline: true,
                    space_in_empty_paren: false,
                    wrap_line_length: 0,
                    preserve_newlines: true,
                    unindent_chained_methods: true
                };

                let formatted = beautify(text, options);

                //
                // 3. POSTPROCESS – restore BML syntax
                //

                // Restore for loops
                formatted = formatted.replace(
                    /\bfor\s*\(let\s+(\w+)\s+of\s+([^)]+)\)/g,
                    "for $1 in $2"
                );

                // Restore elif
                formatted = formatted.replace(/\belse if\s*\(/g, "elif (");

                // Restore AND/OR
                formatted = formatted.replace(/\&\&/g, "AND");
                formatted = formatted.replace(/\|\|/g, "OR");

                // Restore not equal (placeholder back to <>)
                formatted = formatted.replace(/__BML_NOT_EQUAL__/g, "<>");

                // Remove spaces between < and > only (e.g., < > to <>)
                formatted = formatted.replace(/<\s*>/g, "<>");

                // Remove spaces between <> and - when followed by a number (e.g., <> - 1 to <>-1)
                formatted = formatted.replace(/<>\s+-\s*(\d+)/g, '<>-$1');

                //
                // 4. Replace document
                //
                const fullRange = new vscode.Range(
                    document.positionAt(0),
                    document.positionAt(text.length)
                );

                return [vscode.TextEdit.replace(fullRange, formatted)];
            }
        });
    }
}

module.exports = BMLFormattingProvider;
