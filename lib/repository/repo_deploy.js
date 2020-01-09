"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var repo_connect_1 = require("./repo_connect");
var sardines_core_1 = require("sardines-core");
var RepositoryDeployment = (function (_super) {
    __extends(RepositoryDeployment, _super);
    function RepositoryDeployment() {
        return _super.call(this) || this;
    }
    RepositoryDeployment.prototype.validateShoalUser = function (token) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenObj;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.validateToken(token, true)];
                    case 1:
                        tokenObj = _a.sent();
                        if (!this.shoalUser || !this.shoalUser.id
                            || !tokenObj || !tokenObj.account_id || tokenObj.account_id !== this.shoalUser.id) {
                            throw 'Unauthorized user';
                        }
                        return [2];
                }
            });
        });
    };
    RepositoryDeployment.prototype.updateResourceInfo = function (resourceInfo, token) {
        return __awaiter(this, void 0, void 0, function () {
            var resourceInDB;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.validateShoalUser(token)];
                    case 1:
                        _a.sent();
                        return [4, this.createOrUpdateResourceInfo(resourceInfo)];
                    case 2:
                        resourceInDB = _a.sent();
                        return [2, resourceInDB];
                }
            });
        });
    };
    RepositoryDeployment.prototype.createOrUpdateResourceInfo = function (resourceInfo) {
        return __awaiter(this, void 0, void 0, function () {
            var resourceIdentity, resourceInDB;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (resourceInfo.address && Object.keys(resourceInfo.address).length === 0) {
                            delete resourceInfo.address;
                        }
                        resourceIdentity = { name: resourceInfo.name, account: resourceInfo.account, type: resourceInfo.type };
                        return [4, this.db.get('resource', resourceIdentity)];
                    case 1:
                        resourceInDB = _a.sent();
                        if (!resourceInDB) return [3, 3];
                        return [4, this.db.set('resource', resourceInfo, resourceIdentity)];
                    case 2:
                        _a.sent();
                        return [3, 5];
                    case 3: return [4, this.db.set('resource', resourceInfo)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [4, this.db.get('resource', resourceIdentity)];
                    case 6:
                        resourceInDB = _a.sent();
                        return [2, resourceInDB];
                }
            });
        });
    };
    RepositoryDeployment.prototype.generateDeployPlanFromBunchOfServices = function (serviceList) {
        return __awaiter(this, void 0, void 0, function () {
            var result, cacheSourceVersionServices, _i, serviceList_1, service, key, _a, _b, key, pair, sourceId, sourceVersion, sourceInfo, code, services, sampleService, deployPlan, serviceDescObj, _c, services_1, service;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        result = [];
                        cacheSourceVersionServices = {};
                        for (_i = 0, serviceList_1 = serviceList; _i < serviceList_1.length; _i++) {
                            service = serviceList_1[_i];
                            key = service.source_id + ":" + service.version;
                            if (!cacheSourceVersionServices[key]) {
                                cacheSourceVersionServices[key] = [];
                            }
                            cacheSourceVersionServices[key].push(service);
                        }
                        _a = 0, _b = Object.keys(cacheSourceVersionServices);
                        _d.label = 1;
                    case 1:
                        if (!(_a < _b.length)) return [3, 4];
                        key = _b[_a];
                        pair = key.split(':');
                        sourceId = pair[0];
                        sourceVersion = pair[1];
                        return [4, this.querySource({ id: sourceId }, '', true)];
                    case 2:
                        sourceInfo = _d.sent();
                        if (!sourceInfo || !sourceInfo.type)
                            return [3, 3];
                        code = {
                            locationType: sardines_core_1.Sardines.LocationType[sourceInfo.type]
                        };
                        if (sourceInfo.url)
                            code.url = sourceInfo.url;
                        if (sourceInfo.root)
                            code.location = sourceInfo.root;
                        services = cacheSourceVersionServices[key];
                        sampleService = services[0];
                        deployPlan = {
                            providers: [],
                            applications: [{
                                    name: sampleService.application,
                                    code: code,
                                    version: sourceVersion,
                                    init: []
                                }]
                        };
                        serviceDescObj = {
                            application: sampleService.application,
                            services: []
                        };
                        for (_c = 0, services_1 = services; _c < services_1.length; _c++) {
                            service = services_1[_c];
                            serviceDescObj.services.push({
                                name: service.name,
                                module: service.module,
                                arguments: service.arguments ? service.arguments : [],
                                returnType: service.return_type || 'void',
                                isAsync: (service.is_async),
                                filepath: service.file_path
                            });
                        }
                        result.push({ deployPlan: deployPlan, serviceDescObj: serviceDescObj });
                        _d.label = 3;
                    case 3:
                        _a++;
                        return [3, 1];
                    case 4:
                        if (result.length)
                            return [2, result];
                        else
                            return [2, null];
                        return [2];
                }
            });
        });
    };
    RepositoryDeployment.prototype.deployServices = function (targets, token, bypassToken) {
        if (bypassToken === void 0) { bypassToken = false; }
        return __awaiter(this, void 0, void 0, function () {
            var hosts, application, services, version, initParams, providers, res, serviceQuery, serviceList, serviceInsts, i, targetService, tmpQuery, tmpServiceInsts, dplist, hostInfoList, hostQuery, hostInfo, _i, hosts_1, host, hostQuery, pair, hostInfo, _a, hostInfoList_1, hostInfo, deployPlanAndDescObjForHost, _b, dplist_1, dp, deployPlan, serviceDescObj, _c, providers_1, addedProvider, found, _d, _e, provider, _f, serviceList_2, service, _g, _h, ps, _j, _k, pvdr, agentRes;
            return __generator(this, function (_l) {
                switch (_l.label) {
                    case 0:
                        if (!!bypassToken) return [3, 2];
                        return [4, this.validateShoalUser(token)];
                    case 1:
                        _l.sent();
                        _l.label = 2;
                    case 2:
                        hosts = targets.hosts;
                        application = targets.application;
                        services = targets.services;
                        version = targets.version;
                        initParams = targets.initParams;
                        providers = targets.providers;
                        res = [];
                        if (application &&
                            (application.indexOf(';') >= 0 || application.indexOf(',') >= 0 || application.indexOf(':') >= 0)) {
                            throw 'Multiple application mode is not supported while deploy services';
                        }
                        serviceQuery = { application: application, version: version };
                        serviceList = [];
                        if (!(!services || services.length === 0)) return [3, 4];
                        return [4, this.queryService(serviceQuery, token, true, 0)];
                    case 3:
                        serviceInsts = _l.sent();
                        if (serviceInsts && !Array.isArray(serviceInsts)) {
                            serviceList.push(serviceInsts);
                        }
                        else if (serviceInsts) {
                            serviceList = serviceInsts;
                        }
                        return [3, 8];
                    case 4:
                        i = 0;
                        _l.label = 5;
                    case 5:
                        if (!(i < services.length)) return [3, 8];
                        targetService = services[i];
                        tmpQuery = Object.assign({ application: application }, targetService);
                        return [4, this.queryService(tmpQuery, token, true, 0)];
                    case 6:
                        tmpServiceInsts = _l.sent();
                        if (tmpServiceInsts) {
                            if (!Array.isArray(tmpServiceInsts)) {
                                serviceList.push(tmpServiceInsts);
                            }
                            else {
                                Array.prototype.push.apply(serviceList, tmpServiceInsts);
                            }
                        }
                        _l.label = 7;
                    case 7:
                        i++;
                        return [3, 5];
                    case 8: return [4, this.generateDeployPlanFromBunchOfServices(serviceList)];
                    case 9:
                        dplist = _l.sent();
                        if (!dplist || !dplist.length)
                            return [2, null];
                        hostInfoList = [];
                        if (!(!hosts || !hosts.length)) return [3, 11];
                        hostQuery = {
                            status: sardines_core_1.Sardines.Runtime.RuntimeStatus.ready,
                            type: sardines_core_1.Sardines.Runtime.ResourceType.host
                        };
                        return [4, this.db.get('resource', hostQuery, { workload_percentage: 1 }, 1)];
                    case 10:
                        hostInfo = _l.sent();
                        hostInfoList.push(hostInfo);
                        return [3, 15];
                    case 11:
                        _i = 0, hosts_1 = hosts;
                        _l.label = 12;
                    case 12:
                        if (!(_i < hosts_1.length)) return [3, 15];
                        host = hosts_1[_i];
                        if (!host || typeof host !== 'string')
                            return [3, 14];
                        hostQuery = {
                            status: sardines_core_1.Sardines.Runtime.RuntimeStatus.ready,
                            type: sardines_core_1.Sardines.Runtime.ResourceType.host
                        };
                        if (host.indexOf('@') > 0) {
                            pair = host.split('@');
                            hostQuery.account = pair[0];
                            hostQuery.name = pair[1];
                        }
                        else {
                            hostQuery.id = host;
                        }
                        return [4, this.db.get('resource', hostQuery, { workload_percentage: 1 }, 1)];
                    case 13:
                        hostInfo = _l.sent();
                        hostInfoList.push(hostInfo);
                        _l.label = 14;
                    case 14:
                        _i++;
                        return [3, 12];
                    case 15:
                        _a = 0, hostInfoList_1 = hostInfoList;
                        _l.label = 16;
                    case 16:
                        if (!(_a < hostInfoList_1.length)) return [3, 19];
                        hostInfo = hostInfoList_1[_a];
                        if (!hostInfo || !hostInfo.providers || !Array.isArray(hostInfo.providers) || !hostInfo.providers.length)
                            return [3, 18];
                        deployPlanAndDescObjForHost = [];
                        for (_b = 0, dplist_1 = dplist; _b < dplist_1.length; _b++) {
                            dp = dplist_1[_b];
                            deployPlan = dp.deployPlan, serviceDescObj = dp.serviceDescObj;
                            deployPlan.providers = [];
                            Array.prototype.push.apply(deployPlan.providers, hostInfo.providers);
                            if (providers && Array.isArray(providers) && providers.length > 0) {
                                for (_c = 0, providers_1 = providers; _c < providers_1.length; _c++) {
                                    addedProvider = providers_1[_c];
                                    found = false;
                                    for (_d = 0, _e = deployPlan.providers; _d < _e.length; _d++) {
                                        provider = _e[_d];
                                        if (sardines_core_1.utils.isEqual(provider, addedProvider))
                                            found = true;
                                    }
                                    if (!found) {
                                        deployPlan.providers.push(addedProvider);
                                    }
                                }
                            }
                            if (initParams && Array.isArray(initParams) && initParams.length > 0) {
                                Array.prototype.push.apply(deployPlan.applications[0].init, initParams);
                            }
                            for (_f = 0, serviceList_2 = serviceList; _f < serviceList_2.length; _f++) {
                                service = serviceList_2[_f];
                                if (!service.provider_settings || !Array.isArray(service.provider_settings) || !service.provider_settings.length)
                                    continue;
                                for (_g = 0, _h = service.provider_settings; _g < _h.length; _g++) {
                                    ps = _h[_g];
                                    if (!ps.protocol)
                                        continue;
                                    for (_j = 0, _k = hostInfo.providers; _j < _k.length; _j++) {
                                        pvdr = _k[_j];
                                        if (!pvdr.protocol || pvdr.protocol.toLowerCase() !== ps.protocol.toLowerCase())
                                            continue;
                                        if (!pvdr.applicationSettings) {
                                            pvdr.applicationSettings = [{
                                                    application: service.application,
                                                    serviceSettings: []
                                                }];
                                        }
                                        delete ps.protocol;
                                        pvdr.applicationSettings[0].serviceSettings.push({
                                            module: service.module,
                                            name: service.name,
                                            settings: ps
                                        });
                                    }
                                }
                            }
                            deployPlanAndDescObjForHost.push({ deployPlan: deployPlan, serviceDescObj: serviceDescObj });
                        }
                        return [4, this.invokeHostAgent({ id: hostInfo.id }, 'deployService', deployPlanAndDescObjForHost)];
                    case 17:
                        agentRes = _l.sent();
                        if (agentRes.res) {
                            res.push({ hostInfo: hostInfo, res: agentRes.res });
                        }
                        else if (agentRes.error) {
                            console.log('[repository][deployServices] Error while requesting agent:', agentRes.error);
                        }
                        _l.label = 18;
                    case 18:
                        _a++;
                        return [3, 16];
                    case 19:
                        if (!res.length)
                            return [2, null];
                        else
                            return [2, res];
                        return [2];
                }
            });
        });
    };
    RepositoryDeployment.prototype.parseDeployResult = function (runtimeOfApps) {
        return __awaiter(this, void 0, void 0, function () {
            var cacheApps, pvdrCache, _i, _a, pvdr, _b, _c, appSetting, _d, _e, app, cacheEntries, serviceRuntime, appId, e_1, _f, serviceRuntime_1, runtime, identity, serviceInfo, e_2, _g, _h, entry, pvdrKey, rtInst, cache;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        cacheApps = {};
                        pvdrCache = {};
                        for (_i = 0, _a = runtimeOfApps.providers; _i < _a.length; _i++) {
                            pvdr = _a[_i];
                            if (pvdr.applicationSettings) {
                                for (_b = 0, _c = pvdr.applicationSettings; _b < _c.length; _b++) {
                                    appSetting = _c[_b];
                                    if (appSetting.serviceSettings)
                                        delete appSetting.serviceSettings;
                                }
                            }
                            pvdrCache[sardines_core_1.utils.getKey(pvdr.providerSettings.public)] = pvdr;
                        }
                        _d = 0, _e = Object.keys(runtimeOfApps.services);
                        _j.label = 1;
                    case 1:
                        if (!(_d < _e.length)) return [3, 13];
                        app = _e[_d];
                        cacheEntries = {};
                        cacheApps[app] = cacheEntries;
                        serviceRuntime = runtimeOfApps.services[app];
                        appId = null;
                        _j.label = 2;
                    case 2:
                        _j.trys.push([2, 4, , 5]);
                        return [4, this.db.get('application', { name: app })];
                    case 3:
                        appId = _j.sent();
                        if (!appId) {
                            if (app !== 'sardines') {
                                throw "Unregistered application [" + app + "] is not allowed to register service runtime";
                            }
                        }
                        else if (appId.id) {
                            appId = appId.id;
                        }
                        return [3, 5];
                    case 4:
                        e_1 = _j.sent();
                        console.error("ERROR while querying application id application " + app, e_1);
                        return [3, 12];
                    case 5:
                        if (!serviceRuntime || !serviceRuntime.length) {
                            console.error("ERROR: can not log empty service runtime for application [" + app + "]");
                            return [3, 12];
                        }
                        _f = 0, serviceRuntime_1 = serviceRuntime;
                        _j.label = 6;
                    case 6:
                        if (!(_f < serviceRuntime_1.length)) return [3, 12];
                        runtime = serviceRuntime_1[_f];
                        if (!runtime || !runtime.identity || !runtime.entries || !Array.isArray(runtime.entries))
                            return [3, 11];
                        identity = runtime.identity;
                        if (appId)
                            identity.application_id = appId;
                        identity.application = app;
                        if (!identity.module || !identity.name || !identity.version)
                            return [3, 11];
                        if (!(identity.version === '*')) return [3, 10];
                        _j.label = 7;
                    case 7:
                        _j.trys.push([7, 9, , 10]);
                        return [4, this.db.get('service', identity, { create_on: -1 }, 1)];
                    case 8:
                        serviceInfo = _j.sent();
                        if (!serviceInfo && app !== 'sardines') {
                            console.error("logging runtime for unregistered service " + app + ":" + identity.module + ":" + identity.name);
                            throw "unregistered service is not allowed to register service runtime";
                        }
                        else if (serviceInfo) {
                            identity.version = serviceInfo.version;
                            identity.service_id = serviceInfo.id;
                            if (!identity.application_id && serviceInfo.application_id) {
                                identity.application_id = serviceInfo.application_id;
                            }
                        }
                        return [3, 10];
                    case 9:
                        e_2 = _j.sent();
                        console.error("ERROR while querying service version for service runtime " + identity.application + ":" + identity.module + ":" + identity.name, e_2);
                        return [3, 11];
                    case 10:
                        for (_g = 0, _h = runtime.entries; _g < _h.length; _g++) {
                            entry = _h[_g];
                            if (!entry.providerInfo || !entry.providerInfo.driver || !entry.providerInfo.protocol)
                                continue;
                            pvdrKey = sardines_core_1.utils.getKey(entry.providerInfo);
                            if (!cacheEntries[pvdrKey])
                                cacheEntries[pvdrKey] = {
                                    entry: {
                                        type: entry.type,
                                        providerName: entry.providerName || 'unknown',
                                        providerInfo: entry.providerInfo,
                                    },
                                    services: []
                                };
                            rtInst = { identity: identity, settingsForProvider: entry.settingsForProvider };
                            if (runtime.arguments) {
                                rtInst.arguments = runtime.arguments;
                            }
                            cache = cacheEntries[pvdrKey];
                            cache.services.push(rtInst);
                        }
                        _j.label = 11;
                    case 11:
                        _f++;
                        return [3, 6];
                    case 12:
                        _d++;
                        return [3, 1];
                    case 13: return [2, { deployResult: cacheApps, providers: pvdrCache }];
                }
            });
        });
    };
    RepositoryDeployment.prototype.uploadServiceDeployResult = function (runtimeOfApps, token, bypassToken) {
        if (bypassToken === void 0) { bypassToken = false; }
        return __awaiter(this, void 0, void 0, function () {
            var resourceId, dpres, cacheApps, cachePvdr, result, _a, _b, _i, app, _c, _d, _e, pvdrKey, entry, services, rawProvider, _f, services_2, service, identity, settingsForProvider, serviceArguments, serviceInfo, e_3, runtimeQuery, _g, _h, prop, prop, runtimeData, runtimeInst, e_4;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        if (!!bypassToken) return [3, 2];
                        return [4, this.validateToken(token, true)];
                    case 1:
                        _j.sent();
                        _j.label = 2;
                    case 2:
                        if (!runtimeOfApps || !runtimeOfApps.resourceId || !runtimeOfApps.providers || !runtimeOfApps.services) {
                            throw sardines_core_1.utils.unifyErrMesg('invalid deploy result', 'repository', 'update service runtime');
                        }
                        if (!runtimeOfApps.resourceId) {
                            throw sardines_core_1.utils.unifyErrMesg('resourceId is missing in service runtime', 'repository', 'update service runtime');
                        }
                        resourceId = runtimeOfApps.resourceId;
                        return [4, this.parseDeployResult(runtimeOfApps)];
                    case 3:
                        dpres = _j.sent();
                        cacheApps = dpres.deployResult;
                        cachePvdr = dpres.providers;
                        result = {};
                        _a = [];
                        for (_b in cacheApps)
                            _a.push(_b);
                        _i = 0;
                        _j.label = 4;
                    case 4:
                        if (!(_i < _a.length)) return [3, 22];
                        app = _a[_i];
                        result[app] = {};
                        _c = [];
                        for (_d in cacheApps[app])
                            _c.push(_d);
                        _e = 0;
                        _j.label = 5;
                    case 5:
                        if (!(_e < _c.length)) return [3, 21];
                        pvdrKey = _c[_e];
                        entry = cacheApps[app][pvdrKey].entry;
                        services = cacheApps[app][pvdrKey].services;
                        rawProvider = cachePvdr[pvdrKey];
                        result[app][pvdrKey] = [];
                        _f = 0, services_2 = services;
                        _j.label = 6;
                    case 6:
                        if (!(_f < services_2.length)) return [3, 20];
                        service = services_2[_f];
                        identity = service.identity;
                        settingsForProvider = service.settingsForProvider;
                        serviceArguments = service.arguments;
                        if (!(!identity.service_id && app !== 'sardines')) return [3, 10];
                        _j.label = 7;
                    case 7:
                        _j.trys.push([7, 9, , 10]);
                        return [4, this.queryService(identity, token, true)];
                    case 8:
                        serviceInfo = _j.sent();
                        if (serviceInfo) {
                            identity.service_id = serviceInfo.id;
                            if (serviceInfo.application_id && !identity.application_id) {
                                identity.application_id = serviceInfo.application_id;
                            }
                        }
                        return [3, 10];
                    case 9:
                        e_3 = _j.sent();
                        console.error("Error while querying service info for service " + app + ":" + identity.module + ":" + identity.name, e_3);
                        return [3, 19];
                    case 10:
                        runtimeQuery = Object.assign({
                            resource_id: resourceId
                        }, identity, entry);
                        for (_g = 0, _h = [
                            { p: 'providerName', db: 'provider_name' },
                            { p: 'providerInfo', db: 'provider_info' },
                            { p: 'type', db: 'entry_type' },
                        ]; _g < _h.length; _g++) {
                            prop = _h[_g];
                            if (typeof runtimeQuery[prop.p] === 'undefined')
                                continue;
                            runtimeQuery[prop.db] = runtimeQuery[prop.p];
                            delete runtimeQuery[prop.p];
                        }
                        for (prop in runtimeQuery) {
                            if (typeof runtimeQuery[prop] === 'undefined') {
                                delete runtimeQuery[prop];
                            }
                        }
                        runtimeData = Object.assign({
                            last_active_on: Date.now(),
                            status: sardines_core_1.Sardines.Runtime.RuntimeStatus.ready,
                            provider_raw: rawProvider,
                        }, runtimeQuery);
                        if (serviceArguments && identity.application !== 'sardines') {
                            runtimeData.init_params = serviceArguments;
                        }
                        if (settingsForProvider) {
                            runtimeData.settings_for_provider = settingsForProvider;
                        }
                        _j.label = 11;
                    case 11:
                        _j.trys.push([11, 18, , 19]);
                        return [4, this.db.get('service_runtime', runtimeQuery)];
                    case 12:
                        runtimeInst = _j.sent();
                        if (!!runtimeInst) return [3, 15];
                        return [4, this.db.set('service_runtime', runtimeData)];
                    case 13:
                        _j.sent();
                        return [4, this.db.get('service_runtime', runtimeQuery)];
                    case 14:
                        runtimeInst = _j.sent();
                        return [3, 17];
                    case 15: return [4, this.db.set('service_runtime', runtimeData, runtimeQuery)];
                    case 16:
                        _j.sent();
                        _j.label = 17;
                    case 17:
                        if (Array.isArray(runtimeInst)) {
                            runtimeInst = runtimeInst[0];
                        }
                        if (!runtimeInst) {
                            console.error('ERROR: can not find or create a new service runtime for service:', runtimeQuery);
                        }
                        else {
                            result[app][pvdrKey].push({
                                application: runtimeQuery.application,
                                module: runtimeQuery.module,
                                name: runtimeQuery.name,
                                version: runtimeQuery.version,
                                runtimeId: runtimeInst.id
                            });
                        }
                        return [3, 19];
                    case 18:
                        e_4 = _j.sent();
                        console.error("Error while saving runtime for service " + app + ":" + identity.module + ":" + identity.name, e_4);
                        return [3, 19];
                    case 19:
                        _f++;
                        return [3, 6];
                    case 20:
                        _e++;
                        return [3, 5];
                    case 21:
                        _i++;
                        return [3, 4];
                    case 22: return [2, result];
                }
            });
        });
    };
    RepositoryDeployment.prototype.reloadPendingServices = function (resourceInDB) {
        return __awaiter(this, void 0, void 0, function () {
            var pendingServiceRuntimes, targetServiceRuntimeList, targetCache, _i, targetServiceRuntimeList_1, serviceRuntimeInDB, cachekey, target, provider, appSettings, deployJobs, _a, _b, key, self_1, execDeployJob_1;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!resourceInDB || !resourceInDB.id)
                            return [2];
                        return [4, this.db.get('service_runtime', {
                                resource_id: resourceInDB.id,
                                status: "ne:" + sardines_core_1.Sardines.Runtime.RuntimeStatus.ready,
                                application: 'ne:sardines'
                            })];
                    case 1:
                        pendingServiceRuntimes = _c.sent();
                        targetServiceRuntimeList = [];
                        if (pendingServiceRuntimes && !Array.isArray(pendingServiceRuntimes)) {
                            targetServiceRuntimeList = [pendingServiceRuntimes];
                        }
                        else if (pendingServiceRuntimes && Array.isArray(pendingServiceRuntimes)) {
                            targetServiceRuntimeList = pendingServiceRuntimes;
                        }
                        targetCache = {};
                        for (_i = 0, targetServiceRuntimeList_1 = targetServiceRuntimeList; _i < targetServiceRuntimeList_1.length; _i++) {
                            serviceRuntimeInDB = targetServiceRuntimeList_1[_i];
                            cachekey = serviceRuntimeInDB.resource_id + ":" + serviceRuntimeInDB.application + ":" + serviceRuntimeInDB.version + ":" + sardines_core_1.utils.getKey(serviceRuntimeInDB.provider_info);
                            if (!targetCache[cachekey])
                                targetCache[cachekey] = {
                                    application: serviceRuntimeInDB.application,
                                    services: [],
                                    hosts: [resourceInDB.id],
                                    version: serviceRuntimeInDB.version,
                                    useAllProviders: false,
                                    providers: [serviceRuntimeInDB.provider_raw],
                                    initParams: []
                                };
                            target = targetCache[cachekey];
                            target.services.push({
                                module: serviceRuntimeInDB.module,
                                name: serviceRuntimeInDB.name,
                                version: serviceRuntimeInDB.version
                            });
                            if (serviceRuntimeInDB.settings_for_provider) {
                                provider = target.providers[0];
                                if (!provider.applicationSettings) {
                                    provider.applicationSettings = [{
                                            application: serviceRuntimeInDB.application,
                                            commonSettings: {},
                                            serviceSettings: []
                                        }];
                                }
                                appSettings = provider.applicationSettings[0];
                                if (!appSettings.serviceSettings)
                                    appSettings.serviceSettings = [];
                                appSettings.serviceSettings.push({
                                    module: serviceRuntimeInDB.module,
                                    name: serviceRuntimeInDB.name,
                                    settings: serviceRuntimeInDB.settings_for_provider
                                });
                            }
                            if (serviceRuntimeInDB.init_params) {
                                target.initParams.push({
                                    service: {
                                        module: serviceRuntimeInDB.module,
                                        name: serviceRuntimeInDB.name
                                    },
                                    arguments: serviceRuntimeInDB.init_params
                                });
                            }
                        }
                        deployJobs = [];
                        for (_a = 0, _b = Object.keys(targetCache); _a < _b.length; _a++) {
                            key = _b[_a];
                            deployJobs.push(targetCache[key]);
                        }
                        if (!deployJobs.length) return [3, 3];
                        self_1 = this;
                        execDeployJob_1 = function () { return __awaiter(_this, void 0, void 0, function () {
                            var _this = this;
                            return __generator(this, function (_a) {
                                setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                                    var job, res, i, e_5;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                if (!deployJobs.length)
                                                    return [2];
                                                job = deployJobs[0];
                                                _a.label = 1;
                                            case 1:
                                                _a.trys.push([1, 3, , 4]);
                                                return [4, self_1.deployServices(job, '', true)];
                                            case 2:
                                                res = _a.sent();
                                                if (!res || !Array.isArray(res) || !res.length) {
                                                    console.log("[repository][reloadPendingServices] response from agent [" + resourceInDB.id + "]:", sardines_core_1.utils.inspect(res));
                                                }
                                                else if (res.length === 1) {
                                                    console.log("[repository][reloadPendingServices] response from agent [" + resourceInDB.id + "]:", sardines_core_1.utils.inspect(res[0].res));
                                                }
                                                else {
                                                    for (i = 0; i < res.length; i++) {
                                                        console.log("[repository][reloadPendingServices] response from agent [" + resourceInDB.id + "] No." + i + " item:", sardines_core_1.utils.inspect(res[i].res));
                                                    }
                                                }
                                                deployJobs.shift();
                                                return [3, 4];
                                            case 3:
                                                e_5 = _a.sent();
                                                console.error("[repository][reloadPendingServices] ERROR while deploying pending services for agent [" + resourceInDB.id + "]:", e_5);
                                                return [3, 4];
                                            case 4: return [4, execDeployJob_1()];
                                            case 5:
                                                _a.sent();
                                                return [2];
                                        }
                                    });
                                }); }, this.heartbeatTimespan);
                                return [2];
                            });
                        }); };
                        return [4, execDeployJob_1()];
                    case 2:
                        _c.sent();
                        _c.label = 3;
                    case 3: return [2];
                }
            });
        });
    };
    return RepositoryDeployment;
}(repo_connect_1.RepositoryConnect));
exports.RepositoryDeployment = RepositoryDeployment;
