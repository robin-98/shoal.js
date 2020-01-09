"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var sardines_core_1 = require("sardines-core");
exports.rmdir = function (dir) {
    if (fs.lstatSync(dir).isDirectory()) {
        for (var _i = 0, _a = fs.readdirSync(dir); _i < _a.length; _i++) {
            var item = _a[_i];
            var subFilePath = path.join(dir, "./" + item);
            if (fs.lstatSync(subFilePath).isDirectory()) {
                exports.rmdir(subFilePath);
            }
            else {
                fs.unlinkSync(subFilePath);
            }
        }
        fs.rmdirSync(dir);
    }
    else if (fs.lstatSync(dir).isFile()) {
        fs.unlinkSync(dir);
    }
};
exports.parseDeployPlanFile = function (filepath, verbose) {
    if (verbose === void 0) { verbose = false; }
    if (!fs.existsSync(filepath)) {
        console.error("Can not access file " + filepath);
        throw sardines_core_1.utils.unifyErrMesg("Can not access file " + filepath, 'deployer', 'settings file');
    }
    var plan = null;
    try {
        plan = JSON.parse(fs.readFileSync(filepath).toString());
        if (verbose)
            console.log("loaded provider setting file " + filepath);
    }
    catch (e) {
        if (verbose)
            console.error("ERROR when reading and parsing provider setting file " + filepath, e);
        throw sardines_core_1.utils.unifyErrMesg("ERROR when reading and parsing provider setting file " + filepath + ": " + e, 'deployer', 'settings file');
    }
    return plan;
};
exports.getServiceDefinitionsMap = function (applications) {
    if (!applications && !Array.isArray(applications))
        return null;
    var appMap = new Map();
    for (var _i = 0, applications_1 = applications; _i < applications_1.length; _i++) {
        var servDefs = applications_1[_i];
        if (!servDefs.application || typeof servDefs.application !== 'string')
            continue;
        if (!servDefs || !servDefs.services || !Array.isArray(servDefs.services) || servDefs.services.length === 0)
            continue;
        var serviceMap = new Map();
        appMap.set(servDefs.application, serviceMap);
        for (var _a = 0, _b = servDefs.services; _a < _b.length; _a++) {
            var service = _b[_a];
            var servId = service.module + "/" + service.name;
            serviceMap.set(servId, service);
        }
    }
    return appMap;
};
exports.getRepositoryEntiryAddressesFromDeployPlan = function (deployPlan) {
    var providers = [];
    if (deployPlan && deployPlan.providers) {
        for (var _i = 0, _a = deployPlan.providers; _i < _a.length; _i++) {
            var provider = _a[_i];
            if (provider.providerSettings && provider.providerSettings.public && provider.code && provider.code.name) {
                providers.push(provider.providerSettings.public);
            }
        }
    }
    return providers;
};
