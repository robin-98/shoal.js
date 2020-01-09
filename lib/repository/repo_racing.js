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
var repo_healthy_1 = require("./repo_healthy");
var sardines_core_1 = require("sardines-core");
exports.retryLimit = 3;
exports.jobTimeoutLimitInSeconds = 300;
var RepositoryRacing = (function (_super) {
    __extends(RepositoryRacing, _super);
    function RepositoryRacing() {
        return _super.call(this) || this;
    }
    RepositoryRacing.prototype.genJobTicket = function (length) {
        if (length === void 0) { length = 80; }
        var alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/';
        var result = '';
        for (var i = 0; i < length; i++) {
            result += alphabet[Math.round(Math.random() * (alphabet.length - 1))];
        }
        return "" + result + Date.now();
    };
    RepositoryRacing.prototype.racingForJob = function (type, target, retry) {
        if (retry === void 0) { retry = 0; }
        return __awaiter(this, void 0, void 0, function () {
            var deploy_job_ticket, _a, runtimeObj, table, e_1, permission, workingDeployment, query, runtimeInst, e_2, e_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        deploy_job_ticket = this.genJobTicket();
                        _a = this.getRuntimeQueryObj(type, target), runtimeObj = _a.runtimeObj, table = _a.table;
                        runtimeObj.status = sardines_core_1.Sardines.Runtime.RuntimeStatus.deploying;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4, this.db.set(table, Object.assign({}, runtimeObj, { deploy_job_ticket: deploy_job_ticket }))];
                    case 2:
                        _b.sent();
                        return [3, 4];
                    case 3:
                        e_1 = _b.sent();
                        return [3, 4];
                    case 4:
                        permission = false, workingDeployment = null;
                        _b.label = 5;
                    case 5:
                        _b.trys.push([5, 10, , 11]);
                        query = Object.assign({}, runtimeObj, {
                            create_on: "gt:" + (Date.now() - exports.jobTimeoutLimitInSeconds * 1000)
                        });
                        return [4, this.db.get(table, query, { create_on: 1 }, 1)];
                    case 6:
                        runtimeInst = _b.sent();
                        workingDeployment = runtimeInst;
                        if (!!workingDeployment) return [3, 9];
                        if (!(retry < exports.retryLimit)) return [3, 8];
                        return [4, this.racingForJob(type, target, retry + 1)];
                    case 7: return [2, _b.sent()];
                    case 8: return [2, null];
                    case 9:
                        permission = (workingDeployment.deploy_job_ticket === deploy_job_ticket);
                        return [3, 11];
                    case 10:
                        e_2 = _b.sent();
                        return [3, 11];
                    case 11:
                        if (!(!permission && workingDeployment)) return [3, 15];
                        _b.label = 12;
                    case 12:
                        _b.trys.push([12, 14, , 15]);
                        return [4, this.db.set(table, null, Object.assign({}, runtimeObj, { deploy_job_ticket: deploy_job_ticket }))];
                    case 13:
                        _b.sent();
                        return [3, 15];
                    case 14:
                        e_3 = _b.sent();
                        return [3, 15];
                    case 15:
                        if (workingDeployment) {
                            return [2, { permission: permission, runtime: workingDeployment }];
                        }
                        return [2, null];
                }
            });
        });
    };
    RepositoryRacing.prototype.deployResource = function (resourceData, token) {
        return __awaiter(this, void 0, void 0, function () {
            var resource, _i, _a, key, resourceRuntimeObj, resourceInst, race, res;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!resourceData)
                            throw sardines_core_1.utils.unifyErrMesg('invalid host data', 'sardines', 'repository');
                        return [4, this.validateToken(token, true)];
                    case 1:
                        _b.sent();
                        resource = {};
                        if (resourceData.name)
                            resource.name = resourceData.name;
                        if (resourceData.address) {
                            for (_i = 0, _a = ['ipv4', 'port', 'ipv6']; _i < _a.length; _i++) {
                                key = _a[_i];
                                if (!resource.address)
                                    resource.address = {};
                                resource.address[key] = resourceData.address[key];
                            }
                            if (resource.address && resource.address.port && !resource.address.ipv4) {
                                throw sardines_core_1.utils.unifyErrMesg('invalid resource data, ipv4 address is missing', 'sardines', 'repository');
                            }
                        }
                        if (resourceData.tags && Array.isArray(resourceData.tags))
                            resource.tags = resourceData.tags;
                        if (!resource.name && resource.address) {
                            if (resource.address.ipv4) {
                                resource.name = resource.ipv4;
                                if (resource.address.port)
                                    resource.name += ':' + resource.address.port;
                            }
                            else if (resource.address.ipv6) {
                                resource.name = resource.ipv6;
                            }
                        }
                        if (!resource.name)
                            throw sardines_core_1.utils.unifyErrMesg('invalid resource data', 'sardines', 'repository');
                        resource.account = resourceData.account || 'sardines';
                        resource.type = resourceData.type || sardines_core_1.Sardines.Runtime.ResourceType.host;
                        resourceRuntimeObj = { name: resource.name, account: resource.account, type: resource.type };
                        return [4, this.db.get('resource', Object.assign({}, resourceRuntimeObj, { status: sardines_core_1.Sardines.Runtime.RuntimeStatus.ready }), null, 1)];
                    case 2:
                        resourceInst = _b.sent();
                        if (resourceInst)
                            return [2, null];
                        return [4, this.racingForJob(sardines_core_1.Sardines.Runtime.RuntimeTargetType.host, resourceRuntimeObj)];
                    case 3:
                        race = _b.sent();
                        if (!!race) return [3, 4];
                        return [2, null];
                    case 4:
                        if (!race.permission) return [3, 6];
                        return [4, this.deployAgentOnResource(race.runtime)];
                    case 5:
                        res = _b.sent();
                        console.log('deployment response:', res);
                        _b.label = 6;
                    case 6: return [2, race.runtime];
                }
            });
        });
    };
    RepositoryRacing.prototype.deployAgentOnResource = function (resourceInst) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log('going to deploy agent on resource:', resourceInst);
                return [2];
            });
        });
    };
    RepositoryRacing.prototype.deployService = function (service, token) {
        return __awaiter(this, void 0, void 0, function () {
            var race;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.validateToken(token, true)];
                    case 1:
                        _a.sent();
                        return [4, this.racingForJob(sardines_core_1.Sardines.Runtime.RuntimeTargetType.service, service)];
                    case 2:
                        race = _a.sent();
                        if (!race) {
                            return [2, null];
                        }
                        else if (race.permission) {
                            console.log('going to deploy services');
                        }
                        return [2, race.runtime];
                }
            });
        });
    };
    return RepositoryRacing;
}(repo_healthy_1.RepositoryHealthy));
exports.RepositoryRacing = RepositoryRacing;
