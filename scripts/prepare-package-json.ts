import fs from "fs/promises";
import path from "path";
import { modifyPackageJson } from "modify-json-file"

(async () => {
    await fs.copyFile(
        path.join(__dirname, "../package.json"),
        path.join(__dirname, "../build/package.json")
    );
    await modifyPackageJson(
        path.join(__dirname, "../build/package.json"),
        {
            main: "./index.js",
            types: "./index.d.ts"
        }
    )

})().catch(console.error);
