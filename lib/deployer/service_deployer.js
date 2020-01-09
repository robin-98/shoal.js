"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var proc = require("process");
var sardines_core_1 = require("sardines-core");
var sardines_compile_time_tools_1 = require("sardines-compile-time-tools");
var deployer_utils_1 = require("./deployer_utils");
var fs = require("fs");
var params = sardines_core_1.utils.parseArgs().params;
var localGitRoot = './tmp_sardines_git_root';
var getSourceCodeFilePath = function (filepath) {
    var extname = path.extname(filepath);
    if (extname === '.ts') {
        return path.dirname(filepath) + "/" + path.basename(filepath, extname) + ".js";
    }
    else
        return filepath;
};
exports.deploy = function (deployPlan, serviceDefinitions, providerCache, verbose) {
    if (verbose === void 0) { verbose = false; }
    return __awaiter(void 0, void 0, void 0, function () {
        var result, providerInstances, providerSettingsCache, _i, _a, providerDefinition, providerClass, providerName, tmpPd, _b, _c, appSetting, pvdrSettings, fastKey, providerInst, appMap, sourceFiles, serviceRuntimeCache, _d, _e, app, appName, codeBaseDir, _f, serviceDefinitions_1, serviceDef, cache, serviceMap, tmpRoot, sourceCodeDir, appVersion, keys, i, serviceId, service, serviceCodeFile, handler, serviceRuntime, providerNames, name_1, providerName, providerInst, providerSettings, additionalServiceSettings, _g, _h, appSettingsForProvider, commonSettings, _j, _k, ss, tmpService, serviceInPvdr, providerInfo, pvdrkey, providerDefinition, providerPublicInfo, serviceEntry, e_1, errMsg, _l, _m, serviceRuntimeSettings, serviceIdStr, service, sourceCodeFile, handler, srInst;
        return __generator(this, function (_o) {
            switch (_o.label) {
                case 0:
                    if (!serviceDefinitions || !Array.isArray(serviceDefinitions) || !deployPlan.applications || !Array.isArray(deployPlan.applications)) {
                        console.error("No service is setup to deploy");
                        return [2, null];
                    }
                    result = {
                        services: {},
                        providers: []
                    };
                    providerInstances = new Map();
                    providerSettingsCache = new Map();
                    _i = 0, _a = deployPlan.providers;
                    _o.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3, 5];
                    providerDefinition = _a[_i];
                    providerClass = null, providerName = providerDefinition.name;
                    if (!(providerDefinition.code && providerName)) return [3, 4];
                    if (!!sardines_core_1.Factory.getClass(providerName)) return [3, 3];
                    return [4, sardines_compile_time_tools_1.Source.getPackageFromNpm(providerName, providerDefinition.code.locationType, verbose)];
                case 2:
                    providerClass = _o.sent();
                    if (providerClass) {
                        sardines_core_1.Factory.setClass(providerName, providerClass, 'provider');
                    }
                    else {
                        throw sardines_core_1.utils.unifyErrMesg("failed to load provider class [" + providerName + "] from npm package");
                    }
                    _o.label = 3;
                case 3:
                    tmpPd = Object.assign({}, providerDefinition);
                    if (tmpPd.applicationSettings) {
                        for (_b = 0, _c = tmpPd.applicationSettings; _b < _c.length; _b++) {
                            appSetting = _c[_b];
                            if (appSetting.serviceSettings)
                                delete appSetting.serviceSettings;
                        }
                    }
                    result.providers.push(tmpPd);
                    pvdrSettings = Object.assign({}, providerDefinition.providerSettings);
                    fastKey = '';
                    if (pvdrSettings.public) {
                        fastKey = sardines_core_1.utils.getKey(pvdrSettings.public);
                        delete pvdrSettings.public;
                    }
                    else {
                        fastKey = JSON.stringify(pvdrSettings);
                    }
                    providerInst = null;
                    try {
                        providerInst = sardines_core_1.Factory.getInstance(providerName, providerDefinition.providerSettings, 'provider', fastKey);
                    }
                    catch (e) {
                        console.error('[service deployer] Error while getting provider instance for', providerName, providerDefinition.providerSettings);
                    }
                    if (!providerInst) {
                        throw sardines_core_1.utils.unifyErrMesg("failed to instant provider [" + providerName + "]", 'deployer', 'provider');
                    }
                    providerInstances.set(providerName, providerInst);
                    if (verbose) {
                        console.log("[service deployer] loaded provider [" + providerName + "] to deploy services");
                    }
                    providerSettingsCache.set(providerName, providerDefinition);
                    _o.label = 4;
                case 4:
                    _i++;
                    return [3, 1];
                case 5:
                    appMap = deployer_utils_1.getServiceDefinitionsMap(serviceDefinitions);
                    if (!appMap) {
                        throw sardines_core_1.utils.unifyErrMesg("Can not parse service definitions", 'shoal', 'deploy');
                    }
                    sourceFiles = new Map();
                    console.log('[service deployer] appMap:', appMap);
                    serviceRuntimeCache = {};
                    _d = 0, _e = deployPlan.applications;
                    _o.label = 6;
                case 6:
                    if (!(_d < _e.length)) return [3, 23];
                    app = _e[_d];
                    appName = app.name;
                    codeBaseDir = null;
                    if (!app.name || typeof app.name !== 'string')
                        return [3, 22];
                    if (!appMap.has(app.name))
                        return [3, 22];
                    for (_f = 0, serviceDefinitions_1 = serviceDefinitions; _f < serviceDefinitions_1.length; _f++) {
                        serviceDef = serviceDefinitions_1[_f];
                        if (serviceDef.application !== appName)
                            continue;
                        cache = sardines_core_1.Sardines.Transform.fromServiceDescriptionFileToServiceCache(serviceDef, { booleanValue: true, version: app.version });
                        sardines_core_1.RepositoryClient.setLocalServices(cache);
                    }
                    serviceMap = appMap.get(app.name);
                    if (!serviceMap)
                        return [3, 22];
                    if (!(app.code && app.code.locationType === sardines_core_1.Sardines.LocationType.file && app.code.location)) return [3, 7];
                    codeBaseDir = path.resolve(proc.cwd(), app.code.location);
                    return [3, 10];
                case 7:
                    if (!(app.version && app.version !== '*' && app.code
                        && app.code.locationType === sardines_core_1.Sardines.LocationType.git
                        && app.code.location && app.code.url)) return [3, 9];
                    tmpRoot = localGitRoot + "/";
                    return [4, sardines_compile_time_tools_1.Source.getSourceFromGit(app.code.url, tmpRoot, {
                            application: appName,
                            version: app.version,
                            initWorkDir: false,
                            verbose: true
                        })];
                case 8:
                    sourceCodeDir = _o.sent();
                    if (sourceCodeDir)
                        codeBaseDir = path.resolve(sourceCodeDir + "/", app.code.location);
                    return [3, 10];
                case 9: throw sardines_core_1.utils.unifyErrMesg("unsupported source code information, can not deploy services for application [" + app.name + "]", 'shoal', 'deployer');
                case 10:
                    appVersion = app.version;
                    result.services[appName] = [];
                    if (!(codeBaseDir && fs.existsSync(codeBaseDir))) return [3, 22];
                    keys = serviceMap.keys();
                    i = keys.next();
                    _o.label = 11;
                case 11:
                    if (!!i.done) return [3, 18];
                    serviceId = i.value;
                    service = serviceMap.get(serviceId);
                    console.log("[service deployer] going to deploy service [" + serviceId + "]:", service);
                    if (!service.filepath) {
                        throw sardines_core_1.utils.unifyErrMesg("File path is missing: service [" + serviceId + "]", 'shoal', 'deploy');
                    }
                    serviceCodeFile = getSourceCodeFilePath(path.resolve(codeBaseDir, './' + service.filepath));
                    if (!fs.existsSync(serviceCodeFile)) {
                        throw sardines_core_1.utils.unifyErrMesg("Can not find source code file for service [" + serviceId + "] at [" + serviceCodeFile + "]", 'shoal', 'deploy');
                    }
                    if (!sourceFiles.has(serviceCodeFile)) {
                        sourceFiles.set(serviceCodeFile, require(serviceCodeFile));
                    }
                    handler = sourceFiles.get(serviceCodeFile)[service.name];
                    if (!handler) {
                        throw sardines_core_1.utils.unifyErrMesg("Can not get handler from source code file [" + serviceCodeFile + "] for service [" + serviceId + "]", 'shoal', 'deploy');
                    }
                    serviceRuntime = {
                        identity: {
                            application: appName,
                            module: service.module,
                            name: service.name,
                            version: appVersion
                        },
                        entries: []
                    };
                    serviceRuntimeCache[appName + ":" + service.module + ":" + service.name + ":" + appVersion] = serviceRuntime;
                    providerNames = providerInstances.keys();
                    name_1 = providerNames.next();
                    _o.label = 12;
                case 12:
                    if (!!name_1.done) return [3, 17];
                    providerName = name_1.value;
                    providerInst = providerInstances.get(providerName);
                    providerSettings = providerSettingsCache.get(providerName);
                    name_1 = providerNames.next();
                    additionalServiceSettings = null;
                    if (providerSettings.applicationSettings && Array.isArray(providerSettings.applicationSettings)) {
                        for (_g = 0, _h = providerSettings.applicationSettings; _g < _h.length; _g++) {
                            appSettingsForProvider = _h[_g];
                            commonSettings = appSettingsForProvider.commonSettings ? Object.assign({}, appSettingsForProvider.commonSettings) : {};
                            if (appSettingsForProvider.application === app.name && appSettingsForProvider.serviceSettings && Array.isArray(appSettingsForProvider.serviceSettings)) {
                                for (_j = 0, _k = appSettingsForProvider.serviceSettings; _j < _k.length; _j++) {
                                    ss = _k[_j];
                                    if (ss.module === service.module && ss.name === service.name) {
                                        additionalServiceSettings = Object.assign(commonSettings, ss.settings);
                                        break;
                                    }
                                }
                                break;
                            }
                        }
                    }
                    _o.label = 13;
                case 13:
                    _o.trys.push([13, 15, , 16]);
                    tmpService = sardines_core_1.utils.mergeObjects({}, service);
                    tmpService.application = appName;
                    tmpService.version = appVersion;
                    return [4, providerInst.registerService(tmpService, handler, additionalServiceSettings)];
                case 14:
                    serviceInPvdr = _o.sent();
                    if (verbose) {
                        console.log("[service deployer] service [" + appName + ":" + serviceId + ":" + appVersion + "] has been registered");
                    }
                    providerInfo = providerSettings.providerSettings.public;
                    pvdrkey = sardines_core_1.utils.getKey(providerInfo);
                    sardines_core_1.Sardines.Transform.pushServiceIntoProviderCache(providerCache, pvdrkey, providerInfo, tmpService, serviceInPvdr);
                    providerDefinition = providerSettingsCache.get(providerName);
                    providerPublicInfo = providerInst.info || providerDefinition.providerSettings.public;
                    serviceEntry = {
                        type: (providerPublicInfo) ? sardines_core_1.Sardines.Runtime.ServiceEntryType.dedicated : sardines_core_1.Sardines.Runtime.ServiceEntryType.proxy,
                        providerName: providerName
                    };
                    if (providerPublicInfo) {
                        serviceEntry.providerInfo = providerPublicInfo;
                        if (additionalServiceSettings) {
                            serviceEntry.settingsForProvider = additionalServiceSettings;
                        }
                    }
                    serviceRuntime.entries.push(serviceEntry);
                    return [3, 16];
                case 15:
                    e_1 = _o.sent();
                    if (verbose)
                        console.error("ERROR when registering service [" + serviceId + "]", e_1);
                    throw sardines_core_1.utils.unifyErrMesg("Can not register service [" + serviceId + "]", 'shoal', 'deploy');
                case 16: return [3, 12];
                case 17:
                    i = keys.next();
                    if (serviceRuntime.entries.length > 0) {
                        result.services[appName].push(serviceRuntime);
                    }
                    else {
                        errMsg = "Failed to register service [" + appName + ":" + serviceId + "] on all providers";
                        if (verbose)
                            console.error(errMsg);
                        throw sardines_core_1.utils.unifyErrMesg(errMsg, 'shoal', 'deploy');
                    }
                    return [3, 11];
                case 18:
                    if (!(app.init && app.init.length > 0)) return [3, 22];
                    _l = 0, _m = app.init;
                    _o.label = 19;
                case 19:
                    if (!(_l < _m.length)) return [3, 22];
                    serviceRuntimeSettings = _m[_l];
                    serviceIdStr = '';
                    if (typeof serviceRuntimeSettings.service === 'string') {
                        serviceIdStr = serviceRuntimeSettings.service;
                    }
                    else if (serviceRuntimeSettings.service && typeof serviceRuntimeSettings.service === 'object'
                        && serviceRuntimeSettings.service.name
                        && serviceRuntimeSettings.service.module) {
                        serviceIdStr = serviceRuntimeSettings.service.module + "/" + serviceRuntimeSettings.service.name;
                    }
                    if (!serviceIdStr)
                        return [3, 21];
                    service = serviceMap.get(serviceIdStr);
                    console.log("[service deployer] init service [" + serviceIdStr + "]", service);
                    sourceCodeFile = getSourceCodeFilePath(path.resolve(codeBaseDir, './' + service.filepath));
                    if (!fs.existsSync(sourceCodeFile)) return [3, 21];
                    if (!serviceRuntimeSettings.arguments) return [3, 21];
                    handler = sourceFiles.get(sourceCodeFile)[service.name];
                    return [4, handler.apply(void 0, serviceRuntimeSettings.arguments)];
                case 20:
                    _o.sent();
                    srInst = serviceRuntimeCache[appName + ":" + service.module + ":" + service.name + ":" + appVersion];
                    if (srInst) {
                        srInst.arguments = serviceRuntimeSettings.arguments;
                    }
                    _o.label = 21;
                case 21:
                    _l++;
                    return [3, 19];
                case 22:
                    _d++;
                    return [3, 6];
                case 23: return [2, result];
            }
        });
    });
};
exports.exec = function (serviceDefinitions) { return __awaiter(void 0, void 0, void 0, function () {
    var serviceDefs;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (params['definition-file']) {
                    params.definition_file = params['definition-file'];
                }
                if (!params['deploy-plan-file']) return [3, 2];
                params.deploy_plan_file = params['deploy-plan-file'];
                serviceDefs = serviceDefinitions;
                if (params.definition_file && fs.existsSync(params.definition_file)) {
                    try {
                        serviceDefs = JSON.parse(fs.readFileSync(params.definition_file, { encoding: 'utf8' }));
                    }
                    catch (e) {
                        console.error("ERROR when parsing service definition file [" + params.definition_file + "]");
                        throw e;
                    }
                }
                return [4, exports.deploy(params.deploy_plan_file, serviceDefs, params.verbose)];
            case 1: return [2, _a.sent()];
            case 2: return [2, null];
        }
    });
}); };
