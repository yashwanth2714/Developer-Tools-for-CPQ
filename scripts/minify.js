const fs = require("fs");
const path = require("path");
const { minify } = require("terser");

const folder = "."; // current directory (root folder)

async function run() {
    const files = fs.readdirSync(folder);

    for (const file of files) {
        if (file.endsWith(".js") && !file.endsWith(".min.js")) {
            const filePath = path.join(folder, file);
            const code = fs.readFileSync(filePath, "utf8");

            const result = await minify(code, { compress: true, mangle: true });

            const outPath = path.join(folder, file.replace(".js", ".min.js"));
            fs.writeFileSync(outPath, result.code);

            console.log(`✅ Minified: ${file} → ${path.basename(outPath)}`);
        }
    }
}

run();
