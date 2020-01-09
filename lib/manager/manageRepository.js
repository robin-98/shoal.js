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
var deployer_utils_1 = require("../deployer/deployer_utils");
var fs = require("fs");
var proc = require("process");
if (fs.existsSync('../sardines')) {
    console.error('can not find local sardines directory, please run "sardines-init" first');
    proc.exit(1);
}
var sardines = require("../sardines");
console.log('sardines is imported', sardines);
var _a = sardines_core_1.utils.parseArgs(), params = _a.params, files = _a.files;
if (params.help) {
    console.log("\n  manage-sardines-repo  [--<arg>=<value>]  <repository deploy plan file>\n    --create-account=<account name>:<password>    create an account\n    --user=<user name>                : the user to operate the management\n    --password=<password>             : password for that user if needed\n    --remove-service-runtimes         : remove service runtimes mode\n        --hosts                       : host list going to remove service runtimes: [user1@hostname1|hostId], [user2@hostname2|hostId],...\n        --applications                : application name list to be removed: <appname1>,<appname2>,... ; '*' indicates all the applications\n        --modules                     : module list to be removed in the applications ; '*' indicates all the modules\n        --services                    : service list to be removed in the modules, '*' indicates all the services\n        --versions                    : version list to be removed of the services, '*' indicates all the versions\n    --help : this menu\n  ");
}
var manager = function () { return __awaiter(void 0, void 0, void 0, function () {
    var newUsername, newPassword, hostlist, applist, modulelist, servicelist, versionlist, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                setupRepoClient();
                if (!params['create-account']) return [3, 2];
                if (params['create-account'].split(':').length !== 2) {
                    throw 'invalid new account and password';
                }
                newUsername = params['create-account'].split(':')[0];
                newPassword = params['create-account'].split(':')[1];
                return [4, sardines_core_1.RepositoryClient.createUser(newUsername, newPassword)];
            case 1: return [2, _a.sent()];
            case 2:
                if (!params['remove-service-runtimes']) return [3, 4];
                if (!params['hosts'] || typeof params['hosts'] !== 'string') {
                    throw 'unsupported parameter for service runtime removing on hosts';
                }
                hostlist = params['hosts'].split(',');
                applist = (typeof params['applications'] === 'string') ? params['applications'].split(',') : ['*'];
                modulelist = (typeof params['modules'] === 'string') ? params['modules'].split(',') : ['*'];
                servicelist = (typeof params['services'] === 'string') ? params['services'].split(',') : ['*'];
                versionlist = (typeof params['versions'] === 'string') ? params['versions'].split(',') : ['*'];
                return [4, sardines_core_1.RepositoryClient.exec('removeServiceRuntime', {
                        hosts: hostlist,
                        applications: applist,
                        modules: modulelist,
                        services: servicelist,
                        versions: versionlist
                    })];
            case 3: return [2, _a.sent()];
            case 4: return [3, 6];
            case 5:
                e_1 = _a.sent();
                if (e_1.routine && e_1.routine === '_bt_check_unique') {
                    console.error("ERROR: Duplicated host");
                }
                else {
                    console.error("ERROR when managing repository");
                }
                throw e_1;
            case 6: return [2];
        }
    });
}); };
var setupRepoClient = function () {
    if (!files || files.length === 0) {
        throw 'Please provide the deploy plan of the repository';
    }
    var repoDeployPlanFile = files[0];
    var repoDeployPlan = deployer_utils_1.parseDeployPlanFile(repoDeployPlanFile);
    var user = params.user, password = params.password;
    if (!user || !password) {
        for (var _i = 0, _a = repoDeployPlan.applications; _i < _a.length; _i++) {
            var app = _a[_i];
            if (app.name === 'sardines') {
                for (var _b = 0, _c = app.init; _b < _c.length; _b++) {
                    var serv = _c[_b];
                    if (serv.service
                        && serv.service.module === '/repository'
                        && serv.service.name === 'setup') {
                        user = serv.arguments[0].owner.name;
                        password = serv.arguments[0].owner.password;
                        break;
                    }
                }
            }
        }
    }
    if (!user || !password) {
        throw 'Please provide the user name and its password to manage the repository';
    }
    var entries = [];
    for (var _d = 0, _e = repoDeployPlan.providers; _d < _e.length; _d++) {
        var pvdr = _e[_d];
        entries.push({
            providerInfo: pvdr.providerSettings.public,
            user: user,
            password: password
        });
    }
    sardines_core_1.RepositoryClient.setupRepositoryEntries(entries);
};
manager().then(function (res) {
    console.log('Job done, response:', res);
}).catch(function (e) {
    console.error("Repository Manager exit with errors:", e);
});
