// script for workaround https://github.com/microsoft/TypeScript/issues/42853

import { replaceInFileSync } from "replace-in-file";

replaceInFileSync({
    files: ["build/index.d.ts"],
    from: /.*TypeToReplace: true;$/gm,
    to: ""
});

replaceInFileSync({
    files: "build/*.d.ts",
    from: /"(.*)TypeToReplace"/g,
    // todo to regex support
    to: match => match.slice(1, match.lastIndexOf("TypeToReplace"))
});