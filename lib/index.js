#!/usr/bin/env node
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
var sardines_core_1 = require("sardines-core");
var path = require("path");
var proc = require("process");
var fs = require("fs");
var sardines_core_2 = require("sardines-core");
var deployer_utils_1 = require("./deployer/deployer_utils");
var deployer = require("./deployer");
var agent_1 = require("./agent");
var sardinesConfigFilepath = path.resolve(proc.cwd(), './sardines-config.json');
if (fs.existsSync(sardinesConfigFilepath)) {
    console.log('loading sardines config:', sardinesConfigFilepath);
    var sardinesConfig = require(sardinesConfigFilepath);
    if (!sardinesConfig.sardinesDir) {
        throw "invalid sardines config file, sardinesDir property is missing";
    }
    require("./" + sardinesConfig.sardinesDir);
    sardines_core_2.RepositoryClient.setupRepositoryEntriesBySardinesConfig(sardinesConfig, true);
}
exports.deployServicesByFiles = function (serviceDefinitionFile, serviceDeployPlanFile, send) {
    if (send === void 0) { send = true; }
    return __awaiter(void 0, void 0, void 0, function () {
        var serviceFilePath, targetServices, deployPlan, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    serviceFilePath = path.resolve(proc.cwd(), serviceDefinitionFile);
                    if (!fs.existsSync(serviceFilePath)) return [3, 2];
                    targetServices = JSON.parse(fs.readFileSync(serviceFilePath).toString());
                    deployPlan = deployer_utils_1.parseDeployPlanFile(path.resolve(proc.cwd(), serviceDeployPlanFile));
                    return [4, deployer.deployServices(targetServices, deployPlan, agent_1.agentState, send)];
                case 1:
                    res = _a.sent();
                    if (res)
                        return [2, res];
                    else
                        throw 'deploy failed';
                    return [3, 3];
                case 2: throw "can not access service description file [" + serviceFilePath + "]";
                case 3: return [2];
            }
        });
    });
};
var files = sardines_core_1.utils.parseArgs().files;
if (files && files.length >= 2 && files.length % 2 === 0) {
    var jobs = function () { return __awaiter(void 0, void 0, void 0, function () {
        var serviceRuntimeQueue, i, serviceDefinitionFile, serviceDeployPlanFile, deployResult, e_1, _i, serviceRuntimeQueue_1, deployResult;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    serviceRuntimeQueue = [];
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < files.length)) return [3, 6];
                    serviceDefinitionFile = files[i];
                    serviceDeployPlanFile = files[i + 1];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4, exports.deployServicesByFiles(serviceDefinitionFile, serviceDeployPlanFile, false)];
                case 3:
                    deployResult = (_a.sent()).deployResult;
                    if (!deployResult) {
                        throw "can not deploy service in file [" + serviceDeployPlanFile + "]";
                    }
                    else {
                        serviceRuntimeQueue.push({ deployPlanFile: serviceDeployPlanFile, res: deployResult });
                    }
                    console.log("services in " + serviceDefinitionFile + " have been started");
                    return [3, 5];
                case 4:
                    e_1 = _a.sent();
                    console.error("ERROR when deploying services in " + serviceDefinitionFile + ":", e_1);
                    return [3, 5];
                case 5:
                    i += 2;
                    return [3, 1];
                case 6:
                    _i = 0, serviceRuntimeQueue_1 = serviceRuntimeQueue;
                    _a.label = 7;
                case 7:
                    if (!(_i < serviceRuntimeQueue_1.length)) return [3, 10];
                    deployResult = serviceRuntimeQueue_1[_i];
                    return [4, deployer.sendDeployResultToRepository(deployResult.res, agent_1.agentState)];
                case 8:
                    _a.sent();
                    _a.label = 9;
                case 9:
                    _i++;
                    return [3, 7];
                case 10: return [2];
            }
        });
    }); };
    jobs().then(function () { }).catch(function (e) {
        console.error('Error while deploying services:', e);
    });
}
