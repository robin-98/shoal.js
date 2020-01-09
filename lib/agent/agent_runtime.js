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
var sardines_core_1 = require("sardines-core");
var agent_init_1 = require("./agent_init");
var deployer = require("../deployer");
var SardinesAgentRuntime = (function (_super) {
    __extends(SardinesAgentRuntime, _super);
    function SardinesAgentRuntime() {
        return _super.call(this) || this;
    }
    SardinesAgentRuntime.prototype.deployService = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var result, _i, data_1, dp, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!data || !Array.isArray(data) || !data.length) {
                            throw sardines_core_1.utils.unifyErrMesg("Invalid service deployment command from repository", 'agent', 'deploy service');
                        }
                        result = [];
                        _i = 0, data_1 = data;
                        _a.label = 1;
                    case 1:
                        if (!(_i < data_1.length)) return [3, 4];
                        dp = data_1[_i];
                        return [4, deployer.deployServices(dp.serviceDescObj, dp.deployPlan, this.agentState, true)];
                    case 2:
                        res = _a.sent();
                        result.push(res);
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3, 1];
                    case 4: return [2, result];
                }
            });
        });
    };
    SardinesAgentRuntime.prototype.removeServices = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var result, _i, _a, pvdrkey, serviceCache, pvdrInst, removedRuntimeIdList, _b, _c, appName, _d, _e, moduleName, _f, _g, serviceName, _h, _j, version, cacheItem, res, e_1, runtimeIdList, _k, removedRuntimeIdList_1, runtimeId, idx;
            return __generator(this, function (_l) {
                switch (_l.label) {
                    case 0:
                        if (!data || !data.applications || !data.applications.length || data.applications.indexOf('sardines') >= 0
                            || !data.modules || !data.modules.length || !data.services || !data.services.length || !data.versions || !data.versions.length) {
                            throw "illegal request of removing service runtimes";
                        }
                        result = [];
                        _i = 0, _a = Object.keys(this.agentState.providers);
                        _l.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3, 18];
                        pvdrkey = _a[_i];
                        serviceCache = this.agentState.providers[pvdrkey].serviceCache;
                        pvdrInst = sardines_core_1.Factory.getInstance('whatever', {}, 'provider', pvdrkey);
                        if (!pvdrInst)
                            return [3, 17];
                        removedRuntimeIdList = [];
                        _b = 0, _c = Object.keys(serviceCache);
                        _l.label = 2;
                    case 2:
                        if (!(_b < _c.length)) return [3, 16];
                        appName = _c[_b];
                        if (appName === 'sardines')
                            return [3, 15];
                        _d = 0, _e = Object.keys(serviceCache[appName]);
                        _l.label = 3;
                    case 3:
                        if (!(_d < _e.length)) return [3, 14];
                        moduleName = _e[_d];
                        _f = 0, _g = Object.keys(serviceCache[appName][moduleName]);
                        _l.label = 4;
                    case 4:
                        if (!(_f < _g.length)) return [3, 12];
                        serviceName = _g[_f];
                        _h = 0, _j = Object.keys(serviceCache[appName][moduleName][serviceName]);
                        _l.label = 5;
                    case 5:
                        if (!(_h < _j.length)) return [3, 10];
                        version = _j[_h];
                        if (!(data.versions.indexOf('*') >= 0 || data.versions.indexOf(version) >= 0)) return [3, 9];
                        if (!(data.services.indexOf('*') >= 0 || data.services.indexOf(serviceName) >= 0)) return [3, 9];
                        if (!(data.modules.indexOf('*') >= 0 || data.modules.indexOf(moduleName) >= 0)) return [3, 9];
                        if (!(data.applications.indexOf('*') >= 0 || data.applications.indexOf(appName) >= 0)) return [3, 9];
                        if (typeof serviceCache[appName][moduleName][serviceName][version] !== 'object')
                            return [3, 9];
                        cacheItem = (serviceCache[appName][moduleName][serviceName][version]);
                        if (!(typeof pvdrInst.removeService === 'function' && cacheItem.serviceSettingsInProvider)) return [3, 9];
                        _l.label = 6;
                    case 6:
                        _l.trys.push([6, 8, , 9]);
                        return [4, pvdrInst.removeService(cacheItem.serviceSettingsInProvider)];
                    case 7:
                        res = _l.sent();
                        if (res) {
                            console.log("[agent] service [" + appName + ":" + moduleName + ":" + serviceName + ":" + version + "#" + cacheItem.serviceRuntimeId + "] has been removed from provider [" + pvdrkey + "]], provider response:", res);
                            delete serviceCache[appName][moduleName][serviceName][version];
                            if (cacheItem.serviceRuntimeId) {
                                result.push(cacheItem.serviceRuntimeId);
                                removedRuntimeIdList.push(cacheItem.serviceRuntimeId);
                            }
                        }
                        return [3, 9];
                    case 8:
                        e_1 = _l.sent();
                        console.error("[agent] Error while removing service [" + appName + ":" + moduleName + ":" + serviceName + ":" + version + " from provider [" + pvdrkey + "]]:", e_1);
                        return [3, 9];
                    case 9:
                        _h++;
                        return [3, 5];
                    case 10:
                        if (!Object.keys(serviceCache[appName][moduleName][serviceName]).length) {
                            delete serviceCache[appName][moduleName][serviceName];
                        }
                        _l.label = 11;
                    case 11:
                        _f++;
                        return [3, 4];
                    case 12:
                        if (!Object.keys(serviceCache[appName][moduleName]).length) {
                            delete serviceCache[appName][moduleName];
                        }
                        _l.label = 13;
                    case 13:
                        _d++;
                        return [3, 3];
                    case 14:
                        if (!Object.keys(serviceCache[appName]).length) {
                            delete serviceCache[appName];
                        }
                        _l.label = 15;
                    case 15:
                        _b++;
                        return [3, 2];
                    case 16:
                        if (removedRuntimeIdList.length) {
                            runtimeIdList = this.agentState.providers[pvdrkey].serviceRuntimeIds;
                            if (!runtimeIdList || !runtimeIdList.length)
                                return [3, 17];
                            for (_k = 0, removedRuntimeIdList_1 = removedRuntimeIdList; _k < removedRuntimeIdList_1.length; _k++) {
                                runtimeId = removedRuntimeIdList_1[_k];
                                idx = runtimeIdList.indexOf(runtimeId);
                                if (idx >= 0) {
                                    runtimeIdList.splice(idx, 1);
                                }
                            }
                        }
                        _l.label = 17;
                    case 17:
                        _i++;
                        return [3, 1];
                    case 18: return [2, result];
                }
            });
        });
    };
    return SardinesAgentRuntime;
}(agent_init_1.SardinesAgentInit));
exports.SardinesAgentRuntime = SardinesAgentRuntime;
