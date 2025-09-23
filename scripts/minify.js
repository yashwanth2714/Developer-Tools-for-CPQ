const fs = require("fs");
const path = require("path");
const { minify } = require("terser");

const root = "."; // current folder
const excludeDirs = ["node_modules", ".git", "scripts"]; // skip these folders

function getAllJsFiles(dir, allFiles = []) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (!excludeDirs.includes(file)) {
                getAllJsFiles(fullPath, allFiles); // recursive
            }
        } else if (file.endsWith(".js") && !file.endsWith(".min.js")) {
            allFiles.push(fullPath);
        }
    }

    return allFiles;
}

async function run() {
    const jsFiles = getAllJsFiles(root);

    for (const filePath of jsFiles) {
        const code = fs.readFileSync(filePath, "utf8");
        const result = await minify(code, { compress: true, mangle: true });

        const outPath = filePath.replace(/\.js$/, ".min.js");
        fs.writeFileSync(outPath, result.code);

        console.log(`✅ Minified: ${filePath} → ${outPath}`);
    }
}

run();
