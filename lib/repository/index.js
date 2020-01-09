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
var origin = require("./index.sardine");
var sardines_core_1 = require("sardines-core");
exports.setup = function (settings) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!sardines_core_1.Core.isRemote('sardines', '/repository', 'setup')) return [3, 2];
                return [4, sardines_core_1.Core.invoke({
                        identity: {
                            application: 'sardines',
                            module: '/repository',
                            name: 'setup',
                            version: '*'
                        },
                        entries: []
                    }, settings)];
            case 1: return [2, _a.sent()];
            case 2: return [4, origin.setup(settings)];
            case 3: return [2, _a.sent()];
        }
    });
}); };
exports.signIn = function (account, password) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!sardines_core_1.Core.isRemote('sardines', '/repository', 'signIn')) return [3, 2];
                return [4, sardines_core_1.Core.invoke({
                        identity: {
                            application: 'sardines',
                            module: '/repository',
                            name: 'signIn',
                            version: '*'
                        },
                        entries: []
                    }, account, password)];
            case 1: return [2, _a.sent()];
            case 2: return [4, origin.signIn(account, password)];
            case 3: return [2, _a.sent()];
        }
    });
}); };
exports.signOut = function (token) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!sardines_core_1.Core.isRemote('sardines', '/repository', 'signOut')) return [3, 2];
                return [4, sardines_core_1.Core.invoke({
                        identity: {
                            application: 'sardines',
                            module: '/repository',
                            name: 'signOut',
                            version: '*'
                        },
                        entries: []
                    }, token)];
            case 1: return [2, _a.sent()];
            case 2: return [4, origin.signOut(token)];
            case 3: return [2, _a.sent()];
        }
    });
}); };
exports.signUp = function (username, password, token) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!sardines_core_1.Core.isRemote('sardines', '/repository', 'signUp')) return [3, 2];
                return [4, sardines_core_1.Core.invoke({
                        identity: {
                            application: 'sardines',
                            module: '/repository',
                            name: 'signUp',
                            version: '*'
                        },
                        entries: []
                    }, username, password, token)];
            case 1: return [2, _a.sent()];
            case 2: return [4, origin.signUp(username, password, token)];
            case 3: return [2, _a.sent()];
        }
    });
}); };
exports.createOrUpdateApplication = function (application, token) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!sardines_core_1.Core.isRemote('sardines', '/repository', 'createOrUpdateApplication')) return [3, 2];
                return [4, sardines_core_1.Core.invoke({
                        identity: {
                            application: 'sardines',
                            module: '/repository',
                            name: 'createOrUpdateApplication',
                            version: '*'
                        },
                        entries: []
                    }, application, token)];
            case 1: return [2, _a.sent()];
            case 2: return [4, origin.createOrUpdateApplication(application, token)];
            case 3: return [2, _a.sent()];
        }
    });
}); };
exports.queryApplication = function (application, token) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!sardines_core_1.Core.isRemote('sardines', '/repository', 'queryApplication')) return [3, 2];
                return [4, sardines_core_1.Core.invoke({
                        identity: {
                            application: 'sardines',
                            module: '/repository',
                            name: 'queryApplication',
                            version: '*'
                        },
                        entries: []
                    }, application, token)];
            case 1: return [2, _a.sent()];
            case 2: return [4, origin.queryApplication(application, token)];
            case 3: return [2, _a.sent()];
        }
    });
}); };
exports.deleteApplication = function (application, token) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!sardines_core_1.Core.isRemote('sardines', '/repository', 'deleteApplication')) return [3, 2];
                return [4, sardines_core_1.Core.invoke({
                        identity: {
                            application: 'sardines',
                            module: '/repository',
                            name: 'deleteApplication',
                            version: '*'
                        },
                        entries: []
                    }, application, token)];
            case 1: return [2, _a.sent()];
            case 2: return [4, origin.deleteApplication(application, token)];
            case 3: return [2, _a.sent()];
        }
    });
}); };
exports.queryService = function (service, token) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!sardines_core_1.Core.isRemote('sardines', '/repository', 'queryService')) return [3, 2];
                return [4, sardines_core_1.Core.invoke({
                        identity: {
                            application: 'sardines',
                            module: '/repository',
                            name: 'queryService',
                            version: '*'
                        },
                        entries: []
                    }, service, token)];
            case 1: return [2, _a.sent()];
            case 2: return [4, origin.queryService(service, token)];
            case 3: return [2, _a.sent()];
        }
    });
}); };
exports.createOrUpdateService = function (service, token) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!sardines_core_1.Core.isRemote('sardines', '/repository', 'createOrUpdateService')) return [3, 2];
                return [4, sardines_core_1.Core.invoke({
                        identity: {
                            application: 'sardines',
                            module: '/repository',
                            name: 'createOrUpdateService',
                            version: '*'
                        },
                        entries: []
                    }, service, token)];
            case 1: return [2, _a.sent()];
            case 2: return [4, origin.createOrUpdateService(service, token)];
            case 3: return [2, _a.sent()];
        }
    });
}); };
exports.deleteService = function (service, token) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!sardines_core_1.Core.isRemote('sardines', '/repository', 'deleteService')) return [3, 2];
                return [4, sardines_core_1.Core.invoke({
                        identity: {
                            application: 'sardines',
                            module: '/repository',
                            name: 'deleteService',
                            version: '*'
                        },
                        entries: []
                    }, service, token)];
            case 1: return [2, _a.sent()];
            case 2: return [4, origin.deleteService(service, token)];
            case 3: return [2, _a.sent()];
        }
    });
}); };
exports.querySource = function (source, token) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!sardines_core_1.Core.isRemote('sardines', '/repository', 'querySource')) return [3, 2];
                return [4, sardines_core_1.Core.invoke({
                        identity: {
                            application: 'sardines',
                            module: '/repository',
                            name: 'querySource',
                            version: '*'
                        },
                        entries: []
                    }, source, token)];
            case 1: return [2, _a.sent()];
            case 2: return [4, origin.querySource(source, token)];
            case 3: return [2, _a.sent()];
        }
    });
}); };
exports.createOrUpdateSource = function (source, token) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!sardines_core_1.Core.isRemote('sardines', '/repository', 'createOrUpdateSource')) return [3, 2];
                return [4, sardines_core_1.Core.invoke({
                        identity: {
                            application: 'sardines',
                            module: '/repository',
                            name: 'createOrUpdateSource',
                            version: '*'
                        },
                        entries: []
                    }, source, token)];
            case 1: return [2, _a.sent()];
            case 2: return [4, origin.createOrUpdateSource(source, token)];
            case 3: return [2, _a.sent()];
        }
    });
}); };
exports.deleteSource = function (source, token) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!sardines_core_1.Core.isRemote('sardines', '/repository', 'deleteSource')) return [3, 2];
                return [4, sardines_core_1.Core.invoke({
                        identity: {
                            application: 'sardines',
                            module: '/repository',
                            name: 'deleteSource',
                            version: '*'
                        },
                        entries: []
                    }, source, token)];
            case 1: return [2, _a.sent()];
            case 2: return [4, origin.deleteSource(source, token)];
            case 3: return [2, _a.sent()];
        }
    });
}); };
exports.fetchServiceRuntime = function (serviceIdentity, token) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!sardines_core_1.Core.isRemote('sardines', '/repository', 'fetchServiceRuntime')) return [3, 2];
                return [4, sardines_core_1.Core.invoke({
                        identity: {
                            application: 'sardines',
                            module: '/repository',
                            name: 'fetchServiceRuntime',
                            version: '*'
                        },
                        entries: []
                    }, serviceIdentity, token)];
            case 1: return [2, _a.sent()];
            case 2: return [4, origin.fetchServiceRuntime(serviceIdentity, token)];
            case 3: return [2, _a.sent()];
        }
    });
}); };
exports.resourceHeartbeat = function (data, token) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!sardines_core_1.Core.isRemote('sardines', '/repository', 'resourceHeartbeat')) return [3, 2];
                return [4, sardines_core_1.Core.invoke({
                        identity: {
                            application: 'sardines',
                            module: '/repository',
                            name: 'resourceHeartbeat',
                            version: '*'
                        },
                        entries: []
                    }, data, token)];
            case 1: return [2, _a.sent()];
            case 2: return [4, origin.resourceHeartbeat(data, token)];
            case 3: return [2, _a.sent()];
        }
    });
}); };
exports.updateResourceInfo = function (data, token) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!sardines_core_1.Core.isRemote('sardines', '/repository', 'updateResourceInfo')) return [3, 2];
                return [4, sardines_core_1.Core.invoke({
                        identity: {
                            application: 'sardines',
                            module: '/repository',
                            name: 'updateResourceInfo',
                            version: '*'
                        },
                        entries: []
                    }, data, token)];
            case 1: return [2, _a.sent()];
            case 2: return [4, origin.updateResourceInfo(data, token)];
            case 3: return [2, _a.sent()];
        }
    });
}); };
exports.deployServices = function (data, token) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!sardines_core_1.Core.isRemote('sardines', '/repository', 'deployServices')) return [3, 2];
                return [4, sardines_core_1.Core.invoke({
                        identity: {
                            application: 'sardines',
                            module: '/repository',
                            name: 'deployServices',
                            version: '*'
                        },
                        entries: []
                    }, data, token)];
            case 1: return [2, _a.sent()];
            case 2: return [4, origin.deployServices(data, token)];
            case 3: return [2, _a.sent()];
        }
    });
}); };
exports.uploadServiceDeployResult = function (data, token) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!sardines_core_1.Core.isRemote('sardines', '/repository', 'uploadServiceDeployResult')) return [3, 2];
                return [4, sardines_core_1.Core.invoke({
                        identity: {
                            application: 'sardines',
                            module: '/repository',
                            name: 'uploadServiceDeployResult',
                            version: '*'
                        },
                        entries: []
                    }, data, token)];
            case 1: return [2, _a.sent()];
            case 2: return [4, origin.uploadServiceDeployResult(data, token)];
            case 3: return [2, _a.sent()];
        }
    });
}); };
exports.removeServiceRuntime = function (data, token) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!sardines_core_1.Core.isRemote('sardines', '/repository', 'removeServiceRuntime')) return [3, 2];
                return [4, sardines_core_1.Core.invoke({
                        identity: {
                            application: 'sardines',
                            module: '/repository',
                            name: 'removeServiceRuntime',
                            version: '*'
                        },
                        entries: []
                    }, data, token)];
            case 1: return [2, _a.sent()];
            case 2: return [4, origin.removeServiceRuntime(data, token)];
            case 3: return [2, _a.sent()];
        }
    });
}); };
