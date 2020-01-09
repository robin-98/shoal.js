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
var repo_deploy_1 = require("./repo_deploy");
var sardines_core_1 = require("sardines-core");
var sardines_core_2 = require("sardines-core");
var RepositoryRuntime = (function (_super) {
    __extends(RepositoryRuntime, _super);
    function RepositoryRuntime() {
        var _this = _super.call(this) || this;
        _this.defaultLoadBalancingStrategy = sardines_core_1.Sardines.Runtime.LoadBalancingStrategy.evenWorkload;
        _this.workloadThreshold = 85;
        return _this;
    }
    RepositoryRuntime.prototype.findAvailableRuntime = function (type, target, strategy) {
        if (strategy === void 0) { strategy = this.defaultLoadBalancingStrategy; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, runtimeObj, table, orderby, runtimeInst;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.getRuntimeQueryObj(type, target), runtimeObj = _a.runtimeObj, table = _a.table;
                        runtimeObj.status = sardines_core_1.Sardines.Runtime.RuntimeStatus.ready;
                        runtimeObj.workload_percentage = "le:" + this.workloadThreshold;
                        orderby = { workload_percentage: strategy === sardines_core_1.Sardines.Runtime.LoadBalancingStrategy.workloadFocusing ? -1 : 1 };
                        return [4, this.db.get(table, runtimeObj, orderby, 1)];
                    case 1:
                        runtimeInst = _b.sent();
                        return [2, runtimeInst];
                }
            });
        });
    };
    RepositoryRuntime.prototype.getRuntimeQueryObj = function (type, target) {
        var runtimeObj = {}, table = null;
        switch (type) {
            case sardines_core_1.Sardines.Runtime.RuntimeTargetType.service:
                runtimeObj = {
                    service_id: target.id,
                };
                table = 'service_runtime';
                break;
            case sardines_core_1.Sardines.Runtime.RuntimeTargetType.host:
            default:
                runtimeObj = {
                    name: target.name,
                    type: target.type,
                    account: target.account,
                };
                table = 'resource';
                break;
        }
        return { runtimeObj: runtimeObj, table: table };
    };
    RepositoryRuntime.prototype.fetchServiceRuntime = function (serviceIdentity, token, bypassToken) {
        if (bypassToken === void 0) { bypassToken = false; }
        return __awaiter(this, void 0, void 0, function () {
            var res, i, resItem, serviceQuery, service, runtime, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('[repository] fetching service runtime:', serviceIdentity, 'token:', token);
                        if (!serviceIdentity || !token)
                            return [2, null];
                        if (!!bypassToken) return [3, 2];
                        return [4, this.validateToken(token, true)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!Array.isArray(serviceIdentity)) return [3, 7];
                        res = [];
                        i = 0;
                        _a.label = 3;
                    case 3:
                        if (!(i < serviceIdentity.length)) return [3, 6];
                        return [4, this.fetchServiceRuntime(serviceIdentity[i], token, bypassToken = true)];
                    case 4:
                        resItem = _a.sent();
                        if (resItem)
                            res.push(resItem);
                        _a.label = 5;
                    case 5:
                        i++;
                        return [3, 3];
                    case 6: return [2, res];
                    case 7:
                        serviceQuery = {};
                        if (!serviceIdentity.application || !serviceIdentity.module || !serviceIdentity.name) {
                            throw sardines_core_2.utils.unifyErrMesg("Invalid service while querying service runtime", 'repository', 'fetch service runtime');
                        }
                        serviceQuery.application = serviceIdentity.application;
                        serviceQuery.module = serviceIdentity.module;
                        serviceQuery.name = serviceIdentity.name;
                        if (serviceIdentity.version && serviceIdentity.version !== '*')
                            serviceQuery.version = serviceIdentity.version;
                        service = null;
                        if (!(serviceIdentity.application !== 'sardines')) return [3, 9];
                        return [4, this.queryService(serviceQuery, token, bypassToken = true)];
                    case 8:
                        service = (_a.sent());
                        _a.label = 9;
                    case 9:
                        if (!(serviceIdentity.application === 'sardines' || service)) return [3, 11];
                        if (service)
                            serviceQuery = { id: service.id };
                        return [4, this.findAvailableRuntime(sardines_core_1.Sardines.Runtime.RuntimeTargetType.service, serviceQuery)];
                    case 10:
                        runtime = _a.sent();
                        if (runtime) {
                            result = {
                                identity: {
                                    application: serviceIdentity.application,
                                    module: serviceIdentity.module,
                                    name: serviceIdentity.name,
                                    version: runtime.version
                                },
                                entries: [{
                                        type: runtime.entry_type,
                                        providerInfo: runtime.provider_info,
                                        settingsForProvider: runtime.settings_for_provider
                                    }],
                                expireInSeconds: runtime.expire_in_seconds
                            };
                            if (service) {
                                result.arguments = service.arguments;
                                result.returnType = service.return_type;
                            }
                            return [2, result];
                        }
                        _a.label = 11;
                    case 11: return [2, null];
                }
            });
        });
    };
    RepositoryRuntime.prototype.removeServiceRuntime = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var hostlist, _i, hostlist_1, hoststr, pair, hostId, user, host, hostInst, agentData, agentResponse, dbres, e_1, query, applicationList;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        hostlist = data.hosts;
                        if (!(hostlist && hostlist.length)) return [3, 16];
                        _i = 0, hostlist_1 = hostlist;
                        _a.label = 1;
                    case 1:
                        if (!(_i < hostlist_1.length)) return [3, 16];
                        hoststr = hostlist_1[_i];
                        pair = hoststr.split('@');
                        if (!pair || pair.length > 2) {
                            throw "invalid host account and name: " + hoststr + ", which should be \"user@hostname\"";
                        }
                        hostId = '';
                        if (!(pair.length === 1)) return [3, 2];
                        hostId = hoststr;
                        return [3, 4];
                    case 2:
                        user = pair[0];
                        host = pair[1];
                        return [4, this.db.get('resource', {
                                name: host,
                                account: user,
                                type: sardines_core_1.Sardines.Runtime.ResourceType.host
                            }, null, 1, 0, ['id'])];
                    case 3:
                        hostInst = _a.sent();
                        if (hostInst)
                            hostId = hostInst.id;
                        _a.label = 4;
                    case 4:
                        if (!hostId) return [3, 15];
                        agentData = Object.assign({}, data);
                        delete agentData.hosts;
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, 10, , 15]);
                        console.log("[repository][removeServiceRuntime] going to remove service runtimes on host [" + hostId + "]:");
                        console.log(agentData);
                        return [4, this.invokeHostAgent({ id: hostId }, 'removeServices', agentData)];
                    case 6:
                        agentResponse = _a.sent();
                        if (!(agentResponse.res && Array.isArray(agentResponse.res) && agentResponse.res.length)) return [3, 8];
                        return [4, this.db.set('service_runtime', null, { id: agentResponse.res })];
                    case 7:
                        dbres = _a.sent();
                        console.log("[repository] database response of removing service runtimes:", dbres);
                        return [3, 9];
                    case 8:
                        if (agentResponse.error) {
                            throw agentResponse.error;
                        }
                        _a.label = 9;
                    case 9: return [3, 15];
                    case 10:
                        e_1 = _a.sent();
                        console.warn('[repository] Error while requesting agent to remove service runtimes', e_1);
                        query = { resource_id: hostId };
                        if (!(data.applications && data.applications.length && data.applications.indexOf('*') >= 0)) return [3, 12];
                        return [4, this.db.get('service_runtime', query, null, 0, 0, ['application'])];
                    case 11:
                        applicationList = _a.sent();
                        if (applicationList && Array.isArray(applicationList) && applicationList.length) {
                            if (applicationList.indexOf('sardines') >= 0) {
                                applicationList.splice(applicationList.indexOf('sardines'), 1);
                            }
                            if (applicationList.length) {
                                query.application = applicationList;
                            }
                        }
                        return [3, 13];
                    case 12:
                        if (data.applications && data.applications.length) {
                            if (data.applications.indexOf('sardines') >= 0) {
                                data.applications.splice(data.applications.indexOf('sardines'), 1);
                            }
                            if (data.applications.length) {
                                query.application = data.applications;
                            }
                        }
                        _a.label = 13;
                    case 13:
                        if (data.modules && data.modules.length && data.modules.indexOf('*') < 0) {
                            query.module = data.modules;
                        }
                        if (data.services && data.services.length && data.services.indexOf('*') < 0) {
                            query.service = data.services;
                        }
                        if (data.versions && data.versions.length && data.versions.indexOf('*') < 0) {
                            query.version = data.versions;
                        }
                        return [4, this.db.set('service_runtime', null, query)];
                    case 14:
                        _a.sent();
                        console.warn('[reposiotry] service runtimes data removed no matter the host agent alive or not');
                        return [3, 15];
                    case 15:
                        _i++;
                        return [3, 1];
                    case 16: return [2, true];
                }
            });
        });
    };
    return RepositoryRuntime;
}(repo_deploy_1.RepositoryDeployment));
exports.RepositoryRuntime = RepositoryRuntime;
