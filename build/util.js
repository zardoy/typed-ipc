"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWrongProcessMessage = void 0;
// UTILITY FUNCTIONS
const getWrongProcessMessage = (wrongModule, property) => {
    // todo
    const currentSide = !(process === null || process === void 0 ? void 0 : process.type) ? "unknown" :
        process.type === "browser" ? "main"
            : process.type;
    const neededSide = wrongModule === "typedIpcMain" ? "main" : "renderer";
    return `You are trying to call ${wrongModule}.${property} from ${currentSide} process, but ${wrongModule} is available only in ${neededSide} process`;
};
exports.getWrongProcessMessage = getWrongProcessMessage;
