const vscode = require("vscode");

/**
 * Strip comments safely from a line while respecting strings.
 * Returns { code: <line with comments removed>, insideBlock: <bool> }
 */
function stripCommentsFromLine(line, insideBlock) {
    let i = 0;
    let out = "";
    let inString = false;
    let escaped = false;

    while (i < line.length) {
        const two = line.substr(i, 2);
        const ch = line[i];

        // If inside block comment, look for end
        if (insideBlock) {
            if (two === "*/") {
                insideBlock = false;
                i += 2;
                continue;
            }
            i++;
            continue; // skip chars inside block comment
        }

        // String handling
        if (ch === '"' && !escaped) {
            inString = !inString;
            out += ch;
            i++;
            continue;
        }

        if (ch === "\\" && inString && !escaped) {
            escaped = true;
            out += ch;
            i++;
            continue;
        }

        escaped = false;

        // Start of block comment (if not in string)
        if (!inString && two === "/*") {
            insideBlock = true;
            i += 2;
            continue;
        }

        // Start of single-line comment (if not in string)
        if (!inString && two === "//") {
            break; // rest of line is a comment
        }

        // Otherwise normal char
        out += ch;
        i++;
    }

    return { code: out, insideBlock };
}

class BMLDiagnosticsProvider {
    static register(context) {
        const collection = vscode.languages.createDiagnosticCollection("bml");
        context.subscriptions.push(collection);

        vscode.workspace.onDidOpenTextDocument(doc => this.checkDocument(doc, collection));
        vscode.workspace.onDidChangeTextDocument(e => this.checkDocument(e.document, collection));
        vscode.workspace.onDidSaveTextDocument(doc => this.checkDocument(doc, collection));

        vscode.workspace.textDocuments.forEach(doc => this.checkDocument(doc, collection));
    }

    static checkDocument(document, collection) {
        if (document.languageId !== "bml") return;

        let match;
        // Refactored: Process code line by line, only analyze uncommented code
        const diagnostics = [];
        const lines = document.getText().split(/\r?\n/);
        let insideBlockComment = false;
        let codeLines = [];
        // Build codeLines: { line, code }
        for (let i = 0; i < lines.length; i++) {
            const { code, insideBlock } = stripCommentsFromLine(lines[i], insideBlockComment);
            insideBlockComment = insideBlock;
            // Only include lines where uncommented code is not empty and does not start with //
            const trimmed = code.trim();
            if (!trimmed || trimmed.startsWith('//')) {
                codeLines.push({ line: i, code: '' });
            } else {
                codeLines.push({ line: i, code });
            }
        }
        // Build uncommentedText for multi-line rules
        const uncommentedText = codeLines.map(l => l.code || '').join('\n');
        // Refactored: Process variable declarations line by line
        const declaredVars = [];
        codeLines.forEach(({ code, line, startOffset }) => {
            if (!code) return;
            // Find variable declarations in this line
            const varDeclRegex = /(^|[^\w.])([A-Za-z_]\w*)\s*=/g;
            let m;
            while ((m = varDeclRegex.exec(code)) !== null) {
                const varName = m[2];
                // Ignore object property assignments
                if (m.index > 0 && code[m.index - 1] === '.') continue;
                declaredVars.push({ name: varName, line, col: m.index + (m[1] ? m[1].length : 0) });
            }
        });


        // Rule 1: Unused Variables (line by line)
        declaredVars.forEach(v => {
            let count = 0;
            codeLines.forEach(l => {
                if (!l.code) return;
                // Count whole word matches (use escaped word boundaries)
                const regex = new RegExp(`\\b${v.name}\\b`, "g");
                count += (l.code.match(regex) || []).length;
            });
            const alreadyWarned = diagnostics.some(d => d.range.start.line === v.line && d.range.start.character === v.col);
            if (count <= 1 && !alreadyWarned) {
                // Ensure column is within valid range to avoid negative character errors
                const lineText = lines[v.line] || '';
                const col = Math.max(0, Math.min(v.col, lineText.length));
                const start = new vscode.Position(v.line, col);
                const end = new vscode.Position(v.line, Math.min(col + v.name.length, lineText.length));
                diagnostics.push(new vscode.Diagnostic(
                    new vscode.Range(start, end),
                    `Variable "${v.name}" is declared but never used.`,
                    vscode.DiagnosticSeverity.Information
                ));
            }
        });


        // Rule 2: Empty Blocks (multi-line aware, mapped to correct lines)
        const emptyBlockRegex = /\{([\s\r\n]*)\}/g;
        while ((match = emptyBlockRegex.exec(uncommentedText))) {
            const inner = match[1];
            if (/^[\s\r\n]*$/.test(inner)) {
                // Map match.index in uncommentedText to document line/column
                // We built uncommentedText by joining codeLines' code with '\n', so map using those lengths
                let remaining = match.index;
                let mappedLine = 0, mappedCol = 0;
                for (let i = 0; i < codeLines.length; i++) {
                    const l = codeLines[i];
                    const lcode = l.code || '';
                    if (remaining <= lcode.length) {
                        mappedLine = l.line;
                        mappedCol = remaining;
                        break;
                    }
                    // account for the '\n' that was added between lines in uncommentedText
                    remaining -= (lcode.length + 1);
                }
                // Clamp mappedCol to valid range for the target line to prevent negative/too-large columns
                const lineText = lines[mappedLine] || '';
                mappedCol = Math.max(0, Math.min(mappedCol, lineText.length));
                const start = new vscode.Position(mappedLine, mappedCol);
                const end = new vscode.Position(mappedLine, Math.min(mappedCol + match[0].length, lineText.length));
                diagnostics.push(new vscode.Diagnostic(
                    new vscode.Range(start, end),
                    "Empty block detected. Consider removing or adding logic.",
                    vscode.DiagnosticSeverity.Information
                ));
            }
        }


        // Rule 3: Missing Semicolons (comment + string safe)
        insideBlockComment = false;
        codeLines.forEach(({ code, line }, i) => {
            const trimmed = code.trim();
            if (!trimmed) return;
            if (/[{}]$/.test(trimmed)) return;
            if (/^(if|elif|else|for|while|switch|case)\b/i.test(trimmed)) return;
            if (/;\s*$/.test(trimmed)) return;
            const start = new vscode.Position(line, 0);
            const end = new vscode.Position(line, lines[line].length);
            diagnostics.push(new vscode.Diagnostic(
                new vscode.Range(start, end),
                "Missing semicolon at end of statement.",
                vscode.DiagnosticSeverity.Error
            ));
        });


        // Rule 4: Nested Loops (>2 levels deep)
        let loopDepth = 0;
        for (let i = 0; i < codeLines.length; i++) {
            const lineText = codeLines[i].code;
            if (/\bfor\s+.+\{/.test(lineText)) {
                loopDepth++;
                if (loopDepth > 2) {
                    const start = new vscode.Position(codeLines[i].line, 0);
                    const end = new vscode.Position(codeLines[i].line, lines[codeLines[i].line].length);
                    diagnostics.push(new vscode.Diagnostic(
                        new vscode.Range(start, end),
                        `Nested loop depth is ${loopDepth}. Consider refactoring for performance.`,
                        vscode.DiagnosticSeverity.Warning
                    ));
                }
            }
            if (/}/.test(lineText)) {
                if (loopDepth > 0) loopDepth--;
            }
        }


        // Rule 5: Variable naming conventions (strict, per BML spec, line by line)
        const isConstantName = name => /^[A-Z][A-Z0-9_]*$/.test(name);
        const isCamelCase = name => {
            if (/^[a-z]+$/.test(name)) return true;
            return /^[a-z]+(?:[A-Z][a-z0-9]*)+$/.test(name);
        };
        const endsWithArraySuffix = name => /(List|Arr|Array)$/.test(name);
        const endsWithDict = name => /(Dict|Dictionary)$/.test(name);
        const endsWithRecords = name => /Records$/.test(name);
        const isBooleanName = name => /^(is|has)[a-zA-Z].*/.test(name) || name === 'debug';
        codeLines.forEach(({ code, line }) => {
            if (!code) return;
            const varDeclRegex = /(^|[^\w.])([A-Za-z_]\w*)\s*=([^=]|$)/g;
            let m;
            while ((m = varDeclRegex.exec(code)) !== null) {
                const varName = m[2];
                const col = m.index + (m[1] ? m[1].length : 0);
                // Ignore object property assignments
                if (col > 0 && code[col - 1] === '.') continue;
                // RHS for heuristics (everything after '=' on the same line)
                const eqIdx = code.indexOf('=', col);
                const rhs = eqIdx >= 0 ? code.substring(eqIdx + 1).trim() : "";
                const looksLikeArray =
                    /^\[/.test(rhs) ||
                    /\bjsonarray\b/i.test(rhs) ||
                    /\barray\b/i.test(rhs) ||
                    /^(string|integer|float|date|boolean)\s*\[.*\]/i.test(rhs);
                const looksLikeDict = /\bdict\s*\(/i.test(rhs) || /\bdictionary\b/i.test(rhs);
                const looksLikeBooleanLiteral = /^\s*(true|false)\b/i.test(rhs);
                let warning = null;
                if (isConstantName(varName)) {
                    continue;
                }
                if (looksLikeDict || endsWithDict(varName)) {
                    if (!endsWithDict(varName)) {
                        warning = `Dictionary variable "${varName}" should use the Dict/Dictionary suffix (e.g., sequenceNumDict).`;
                    } else if (!isCamelCase(varName)) {
                        warning = `Dictionary variable "${varName}" should use camelCase (e.g., sequenceNumDict).`;
                    }
                }
                if (!warning && looksLikeArray) {
                    if (!endsWithArraySuffix(varName)) {
                        warning = `Array variable "${varName}" should have a suffix like Arr/Array/List.`;
                    }
                }
                if (!warning && looksLikeBooleanLiteral) {
                    if (!isBooleanName(varName)) {
                        warning = `Boolean variable "${varName}" should be prefixed with "is" or "has" (e.g., isMandatory).`;
                    } else if (!isCamelCase(varName)) {
                        warning = `Boolean variable "${varName}" should use camelCase (e.g., isMandatory, hasValue).`;
                    }
                }
                if (!warning && endsWithRecords(varName)) {
                    const base = varName.replace(/Records$/, "");
                    if (!isCamelCase(base)) {
                        warning = `RecordSet name "${varName}" should use camelCase base (e.g., partRecords).`;
                    }
                }
                if (warning) {
                    const start = new vscode.Position(line, col);
                    const end = new vscode.Position(line, col + varName.length);
                    diagnostics.push(new vscode.Diagnostic(
                        new vscode.Range(start, end),
                        warning,
                        vscode.DiagnosticSeverity.Warning
                    ));
                }
            }
        });


        // Rule 6: One statement per line (never more than one ;)
        codeLines.forEach(({ code, line }) => {
            const semiCount = (code.match(/;/g) || []).length;
            if (semiCount > 1) {
                diagnostics.push(new vscode.Diagnostic(
                    new vscode.Range(new vscode.Position(line, 0), new vscode.Position(line, lines[line].length)),
                    "Multiple statements on one line are discouraged.",
                    vscode.DiagnosticSeverity.Error
                ));
            }
        });


        // Rule 7: Print statements should be debug-guarded
        for (let i = 0; i < codeLines.length; i++) {
            const line = codeLines[i].code;
            if (/\bprint\b/.test(line)) {
                const prevLine = i > 0 ? codeLines[i - 1].code : "";
                if (!/if\s*\(\s*debug\s*\)/i.test(prevLine)) {
                    diagnostics.push(new vscode.Diagnostic(
                        new vscode.Range(new vscode.Position(codeLines[i].line, 0), new vscode.Position(codeLines[i].line, lines[codeLines[i].line].length)),
                        "Print statements should be wrapped in a debug flag check.",
                        vscode.DiagnosticSeverity.Hint
                    ));
                }
            }
        }


        // Rule 8: Functions with single arg must use parentheses
        // e.g. not x   → should be not(x)
        const singleArgFuncRegex = /\b(not|isnull|upper|lower)\s+[A-Za-z_]\w*/g;
        while ((match = singleArgFuncRegex.exec(uncommentedText))) {
            const start = document.positionAt(match.index);
            const end = document.positionAt(match.index + match[0].length);
            diagnostics.push(new vscode.Diagnostic(
                new vscode.Range(start, end),
                `Function "${match[1]}" should enclose its argument in parentheses.`,
                vscode.DiagnosticSeverity.Error
            ));
        }


        // Rule 9: Extremely long statements (>150 chars)
        codeLines.forEach(({ code, line }) => {
            if (code.length > 150) {
                diagnostics.push(new vscode.Diagnostic(
                    new vscode.Range(new vscode.Position(line, 0), new vscode.Position(line, lines[line].length)),
                    "Line too long (>150 chars). Consider splitting across multiple lines.",
                    vscode.DiagnosticSeverity.Warning
                ));
            }
        });


        // Final push
        collection.set(document.uri, diagnostics);
    }
}

module.exports = BMLDiagnosticsProvider;
