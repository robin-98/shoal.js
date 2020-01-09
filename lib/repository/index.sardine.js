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
var repo_racing_1 = require("./repo_racing");
var sardines_core_1 = require("sardines-core");
var unifyAsyncHandler = sardines_core_1.utils.unifyAsyncHandler, unifyErrMesg = sardines_core_1.utils.unifyErrMesg;
var repoInst = null;
var errRepoNotSetupYet = unifyErrMesg('Repository is not setup yet', 'repository', 'setup');
var checkRepoStatus = function () {
    if (!repoInst)
        throw errRepoNotSetupYet;
};
exports.setup = function (settings) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (repoInst)
                    return [2];
                if (!repoInst)
                    repoInst = new repo_racing_1.RepositoryRacing();
                return [4, repoInst.setup(settings)];
            case 1: return [2, _a.sent()];
        }
    });
}); };
exports.signIn = function (account, password) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                checkRepoStatus();
                return [4, unifyAsyncHandler('repository', 'sign in', repoInst.signIn, repoInst)(account, password)];
            case 1: return [2, _a.sent()];
        }
    });
}); };
exports.signOut = function (token) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                checkRepoStatus();
                return [4, unifyAsyncHandler('repository', 'sign out', repoInst.signOut, repoInst)(token)];
            case 1: return [2, _a.sent()];
        }
    });
}); };
exports.signUp = function (username, password, token) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                checkRepoStatus();
                return [4, unifyAsyncHandler('repository', 'sign up', repoInst.createAccount, repoInst)(username, password, token)];
            case 1: return [2, _a.sent()];
        }
    });
}); };
exports.createOrUpdateApplication = function (application, token) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                checkRepoStatus();
                return [4, unifyAsyncHandler('repository', 'create or update application', repoInst.createOrUpdateApplication, repoInst)(application, token)];
            case 1: return [2, _a.sent()];
        }
    });
}); };
exports.queryApplication = function (application, token) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                checkRepoStatus();
                return [4, unifyAsyncHandler('repository', 'query application', repoInst.queryApplication, repoInst)(application, token)];
            case 1: return [2, _a.sent()];
        }
    });
}); };
exports.deleteApplication = function (application, token) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                checkRepoStatus();
                return [4, unifyAsyncHandler('repository', 'delete application', repoInst.deleteApplication, repoInst)(application, token)];
            case 1: return [2, _a.sent()];
        }
    });
}); };
exports.queryService = function (service, token) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                checkRepoStatus();
                return [4, unifyAsyncHandler('repository', 'query service', repoInst.queryService, repoInst)(service, token)];
            case 1: return [2, _a.sent()];
        }
    });
}); };
exports.createOrUpdateService = function (service, token) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                checkRepoStatus();
                return [4, unifyAsyncHandler('repository', 'create or update service', repoInst.createOrUpdateService, repoInst)(service, token)];
            case 1: return [2, _a.sent()];
        }
    });
}); };
exports.deleteService = function (service, token) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                checkRepoStatus();
                return [4, unifyAsyncHandler('repository', 'delete service', repoInst.deleteService, repoInst)(service, token)];
            case 1: return [2, _a.sent()];
        }
    });
}); };
exports.querySource = function (source, token) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                checkRepoStatus();
                return [4, unifyAsyncHandler('repository', 'query source', repoInst.querySource, repoInst)(source, token)];
            case 1: return [2, _a.sent()];
        }
    });
}); };
exports.createOrUpdateSource = function (source, token) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                checkRepoStatus();
                return [4, unifyAsyncHandler('repository', 'create or update service', repoInst.createOrUpdateSource, repoInst)(source, token)];
            case 1: return [2, _a.sent()];
        }
    });
}); };
exports.deleteSource = function (source, token) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                checkRepoStatus();
                return [4, unifyAsyncHandler('repository', 'delete service', repoInst.deleteSource, repoInst)(source, token)];
            case 1: return [2, _a.sent()];
        }
    });
}); };
exports.fetchServiceRuntime = function (serviceIdentity, token) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                checkRepoStatus();
                return [4, unifyAsyncHandler('repository', 'fetch service runtime', repoInst.fetchServiceRuntime, repoInst)(serviceIdentity, token)];
            case 1: return [2, _a.sent()];
        }
    });
}); };
exports.resourceHeartbeat = function (data, token) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!data)
                    throw unifyErrMesg('invalid data', 'repository', 'resourceHeartbeat');
                checkRepoStatus();
                return [4, unifyAsyncHandler('repository', 'resource heartbeat', repoInst.resourceHeartbeat, repoInst)(data, token)];
            case 1: return [2, _a.sent()];
        }
    });
}); };
exports.updateResourceInfo = function (data, token) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!data)
                    throw unifyErrMesg('invalid data', 'repository', 'updateResourceInfo');
                checkRepoStatus();
                return [4, unifyAsyncHandler('repository', 'update resource info', repoInst.updateResourceInfo, repoInst)(data, token)];
            case 1: return [2, _a.sent()];
        }
    });
}); };
exports.deployServices = function (data, token) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!data)
                    throw unifyErrMesg('invalid data', 'repository', 'deployService');
                checkRepoStatus();
                return [4, unifyAsyncHandler('repository', 'deploy services', repoInst.deployServices, repoInst)(data, token)];
            case 1: return [2, _a.sent()];
        }
    });
}); };
exports.uploadServiceDeployResult = function (data, token) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!data)
                    throw unifyErrMesg('invalid data', 'repository', 'uploadServiceDeployResult');
                checkRepoStatus();
                return [4, unifyAsyncHandler('repository', 'upload service deployment result', repoInst.uploadServiceDeployResult, repoInst)(data, token)];
            case 1: return [2, _a.sent()];
        }
    });
}); };
exports.removeServiceRuntime = function (data, token) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!data)
                    throw unifyErrMesg('invalid data', 'repository', 'removeServiceRuntime');
                checkRepoStatus();
                return [4, unifyAsyncHandler('repository', 'remove service runtime on hosts', repoInst.removeServiceRuntime, repoInst)(data, token)];
            case 1: return [2, _a.sent()];
        }
    });
}); };
