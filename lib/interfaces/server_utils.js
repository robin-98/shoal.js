"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
exports.debugJson = function (obj) {
    if (!obj || typeof obj !== 'object' || !Object.keys(obj).length) {
        throw "[ServerUtils][debugJson] unsupported object type[" + typeof obj + "] for debug";
    }
    for (var _i = 0, _a = Object.keys(obj); _i < _a.length; _i++) {
        var key = _a[_i];
        var filepath = "./debug-" + key + ".json";
        console.log("[ServerUtils][debugJson] dumping object <" + typeof obj[key] + ">" + key + " at " + filepath);
        fs.writeFileSync(filepath, JSON.stringify(obj[key], null, 4));
    }
};
