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
var repo_data_structure_1 = require("./repo_data_structure");
var sardines_core_1 = require("sardines-core");
var calcWorkload = function (sysload) {
    var load = 100;
    load -= sysload.cpu.idle;
    return Math.round(load);
};
var RepositoryHeart = (function (_super) {
    __extends(RepositoryHeart, _super);
    function RepositoryHeart() {
        var _this = _super.call(this) || this;
        _this.intervalHeartbeat = null;
        _this.heartbeatTimespan = 1 * 1000;
        _this.heartbeatCount = 0;
        _this.jobsInHeart = {};
        if (typeof _this.removeOutDatePerfData === 'function') {
            _this.appendJobInHeart('removeOutDatePerfData');
        }
        if (typeof _this.checkPendingServices === 'function') {
            _this.appendJobInHeart('checkPendingServices', 1, 10);
        }
        _this.startHeart();
        return _this;
    }
    RepositoryHeart.prototype.appendJobInHeart = function (jobName, startRound, intervalCounts) {
        if (startRound === void 0) { startRound = 3600; }
        if (intervalCounts === void 0) { intervalCounts = 3600; }
        if (jobName && !this.jobsInHeart[jobName] && typeof this[jobName] === 'function') {
            this.jobsInHeart[jobName] = {
                name: jobName,
                intervalCounts: intervalCounts <= 0 ? 1 : intervalCounts,
                startRound: startRound <= 0 ? 1 : startRound
            };
        }
    };
    RepositoryHeart.prototype.stopHeart = function () {
        if (this.intervalHeartbeat) {
            clearInterval(this.intervalHeartbeat);
        }
    };
    RepositoryHeart.prototype.startHeart = function () {
        this.intervalHeartbeat = setInterval(this.heart.bind(this), this.heartbeatTimespan);
    };
    RepositoryHeart.prototype.heart = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, jobName, job, begin, end, e_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.isInited) return [3, 6];
                        this.heartbeatCount++;
                        _i = 0, _a = Object.keys(this.jobsInHeart);
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3, 6];
                        jobName = _a[_i];
                        if (!this[jobName] || typeof this[jobName] !== 'function')
                            return [3, 5];
                        job = this.jobsInHeart[jobName];
                        if (this.heartbeatCount !== job.startRound && (this.heartbeatCount - job.startRound) % job.intervalCounts !== 0)
                            return [3, 5];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        begin = Date.now();
                        return [4, this[jobName].apply(this)];
                    case 3:
                        _b.sent();
                        end = Date.now();
                        console.log("sardines repository job [" + jobName + "] done in No." + this.heartbeatCount + " heartbeat in " + (end - begin) + "ms");
                        return [3, 5];
                    case 4:
                        e_1 = _b.sent();
                        console.error("Error of sardines repository heartbeat:", e_1);
                        return [3, 5];
                    case 5:
                        _i++;
                        return [3, 1];
                    case 6: return [2];
                }
            });
        });
    };
    RepositoryHeart.prototype.removeOutDatePerfData = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.db.set('resource_performance', null, {
                            create_on: "lt:" + (Date.now() - 1000 * 60 * 60 * 24)
                        })];
                    case 1:
                        _a.sent();
                        return [4, this.db.set('token', null, {
                                expire_on: "lt:" + Date.now()
                            })];
                    case 2:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    RepositoryHeart.prototype.resourceHeartbeat = function (data, token) {
        return __awaiter(this, void 0, void 0, function () {
            var sysload, tokenObj, resourcePerf, workload, newStatus;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sysload = data.load;
                        return [4, this.validateToken(token, true)];
                    case 1:
                        tokenObj = _a.sent();
                        if (!this.shoalUser || !this.shoalUser.id
                            || !tokenObj || !tokenObj.account_id || tokenObj.account_id !== this.shoalUser.id) {
                            throw 'Unauthorized user';
                        }
                        return [4, this.db.set('resource_performance', sysload)];
                    case 2:
                        resourcePerf = _a.sent();
                        if (!resourcePerf) return [3, 6];
                        if (!sysload.resource_id) return [3, 5];
                        workload = calcWorkload(sysload);
                        newStatus = {
                            workload_percentage: workload,
                            status: sardines_core_1.Sardines.Runtime.RuntimeStatus.ready,
                            last_active_on: Date.now()
                        };
                        return [4, this.db.set('resource', newStatus, { id: sysload.resource_id })];
                    case 3:
                        _a.sent();
                        if (!(data.runtimes && Array.isArray(data.runtimes) && data.runtimes.length)) return [3, 5];
                        return [4, this.db.set('service_runtime', newStatus, { id: data.runtimes })];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [2, 'OK'];
                    case 6: return [2, null];
                }
            });
        });
    };
    RepositoryHeart.prototype.checkPendingServices = function () {
        return __awaiter(this, void 0, void 0, function () {
            var resourcelist, self_1, _loop_1, _i, resourcelist_1, resource, e_2;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4, this.db.get('resource', {
                                status: sardines_core_1.Sardines.Runtime.RuntimeStatus.ready
                            }, null, 0)];
                    case 1:
                        resourcelist = _a.sent();
                        if (!resourcelist)
                            return [2];
                        if (resourcelist && !Array.isArray(resourcelist))
                            resourcelist = [resourcelist];
                        self_1 = this;
                        _loop_1 = function (resource) {
                            setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (!(typeof self_1['reloadPendingServices'] === 'function')) return [3, 2];
                                            return [4, self_1.reloadPendingServices(resource)];
                                        case 1:
                                            _a.sent();
                                            _a.label = 2;
                                        case 2: return [2];
                                    }
                                });
                            }); }, 0);
                        };
                        for (_i = 0, resourcelist_1 = resourcelist; _i < resourcelist_1.length; _i++) {
                            resource = resourcelist_1[_i];
                            _loop_1(resource);
                        }
                        return [3, 3];
                    case 2:
                        e_2 = _a.sent();
                        console.error("Error while checking pending services:", e_2);
                        return [3, 3];
                    case 3: return [2];
                }
            });
        });
    };
    return RepositoryHeart;
}(repo_data_structure_1.RepositoryDataStructure));
exports.RepositoryHeart = RepositoryHeart;
