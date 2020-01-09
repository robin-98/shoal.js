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
var repo_heart_1 = require("./repo_heart");
var sardines_core_1 = require("sardines-core");
var RepositoryConnect = (function (_super) {
    __extends(RepositoryConnect, _super);
    function RepositoryConnect() {
        return _super.call(this) || this;
    }
    RepositoryConnect.prototype.invokeHostAgent = function (target, service, data) {
        return __awaiter(this, void 0, void 0, function () {
            var hostId, rtInst, _a, provider_info, settings_for_provider, entry_type, runtime, agentResp, e_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        if (!target || (!target.name && !target.id && !target.account)
                            || (target.name && !target.account) || (!target.name && target.account)) {
                            throw sardines_core_1.utils.unifyErrMesg("unsupported target data", 'repository', 'invoke host agent');
                        }
                        if (!service) {
                            throw sardines_core_1.utils.unifyErrMesg("unsupported agent service [" + service + "]", 'repository', 'invoke host agent');
                        }
                        hostId = '';
                        if (!target.id) return [3, 1];
                        hostId = target.id;
                        return [3, 3];
                    case 1: return [4, this.db.get('resource', {
                            name: target.name,
                            account: target.account,
                            type: sardines_core_1.Sardines.Runtime.ResourceType.host
                        }, null, 1, 0, ['id'])];
                    case 2:
                        hostId = _b.sent();
                        _b.label = 3;
                    case 3:
                        if (!hostId) {
                            throw sardines_core_1.utils.unifyErrMesg({
                                message: "can not find target host [name: " + target.name + ", account: " + target.account + "] in repository",
                                tag: 'target_host_not_found'
                            }, 'repository', 'invoke host agent');
                        }
                        return [4, this.db.get('service_runtime', {
                                resource_id: hostId,
                                application: 'sardines',
                                module: '/agent',
                                name: service,
                                status: sardines_core_1.Sardines.Runtime.RuntimeStatus.ready
                            }, null, 1, 0, ['provider_info', 'settings_for_provider', 'entry_type'])];
                    case 4:
                        rtInst = _b.sent();
                        _a = rtInst || {}, provider_info = _a.provider_info, settings_for_provider = _a.settings_for_provider, entry_type = _a.entry_type;
                        if (!provider_info || !entry_type) {
                            throw sardines_core_1.utils.unifyErrMesg("can not find alive agent on target host [name: " + target.name + ", account: " + target.account + ", id: " + hostId + "]", 'repository', 'invoke host agent');
                        }
                        runtime = {
                            identity: {
                                application: 'sardines',
                                module: '/agent',
                                name: service
                            },
                            entries: [{
                                    providerInfo: provider_info,
                                    settingsForProvider: settings_for_provider,
                                    type: entry_type
                                }],
                            arguments: [{
                                    name: 'data',
                                    type: 'any'
                                }]
                        };
                        return [4, sardines_core_1.Core.invoke(runtime, data)];
                    case 5:
                        agentResp = _b.sent();
                        return [2, { res: agentResp }];
                    case 6:
                        e_1 = _b.sent();
                        return [2, { error: e_1 }];
                    case 7: return [2];
                }
            });
        });
    };
    return RepositoryConnect;
}(repo_heart_1.RepositoryHeart));
exports.RepositoryConnect = RepositoryConnect;
