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
var sardines_built_in_services_1 = require("sardines-built-in-services");
var sardines_core_1 = require("sardines-core");
exports.extraPostgresDBStruct = {
    account: {
        can_create_application: 'Boolean NOT NULL DEFAULT true',
        can_create_service: 'Boolean NOT NULL DEFAULT true',
        can_manage_repository: 'Boolean NOT NULL DEFAULT false'
    },
    application: {
        id: 'UUID PRIMARY KEY DEFAULT uuid_generate_v4()',
        create_on: 'TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP',
        last_access_on: 'TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP',
        name: 'VARCHAR(100) UNIQUE',
        is_public: 'Boolean NOT NULL DEFAULT true',
        owner_id: 'UUID',
        developers: 'UUID[]'
    },
    service: {
        id: 'UUID PRIMARY KEY DEFAULT uuid_generate_v4()',
        create_on: 'TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP',
        last_access_on: 'TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP',
        owner_id: 'UUID',
        developers: 'UUID[]',
        is_public: 'Boolean NOT NULL DEFAULT true',
        application_id: 'UUID',
        application: 'VARCHAR(100)',
        module: 'VARCHAR(300)',
        name: 'VARCHAR(100)',
        version: 'VARCHAR(20)',
        source_id: 'UUID',
        arguments: [{
                name: 'VARCHAR(50)',
                type: 'VARCHAR(100)'
            }],
        return_type: 'VARCHAR(100)',
        is_async: 'BOOLEAN',
        file_path: 'VARCHAR(100)',
        UNIQUE: ['application', 'module', 'name', 'version']
    },
    source: {
        id: 'UUID PRIMARY KEY DEFAULT uuid_generate_v4()',
        create_on: 'TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP',
        last_access_on: 'TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP',
        type: 'VARCHAR(30)',
        URL: 'VARCHAR(300)',
        root: 'VARCHAR(100) DEFAULT \'/\''
    },
    service_runtime: {
        id: 'UUID PRIMARY KEY DEFAULT uuid_generate_v4()',
        application_id: 'UUID',
        application: 'VARCHAR(100)',
        module: 'VARCHAR(300)',
        name: 'VARCHAR(100)',
        version: 'VARCHAR(20)',
        create_on: 'TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP',
        last_access_on: 'TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP',
        deploy_job_ticket: 'VARCHAR(100)',
        status: 'VARCHAR(30)',
        last_active_on: 'TIMESTAMP(3)',
        resource_id: 'UUID',
        threads: 'SMALLINT DEFAULT 1',
        expire_in_seconds: 'INT DEFAULT 900',
        workload_percentage: 'SMALLINT DEFAULT 100',
        service_id: 'UUID',
        entry_type: 'VARCHAR(20)',
        provider_raw: 'JSONB',
        provider_name: 'VARCHAR(100)',
        provider_info: 'JSONB',
        settings_for_provider: 'JSONB',
        init_params: 'JSONB',
    },
    resource: {
        id: 'UUID PRIMARY KEY DEFAULT uuid_generate_v4()',
        create_on: 'TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP',
        last_access_on: 'TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP',
        deploy_job_ticket: 'VARCHAR(100)',
        status: 'VARCHAR(30)',
        workload_percentage: 'SMALLINT DEFAULT 100',
        name: 'VARCHAR(200) NOT NULL',
        account: 'VARCHAR(50)',
        type: 'VARCHAR(100) NOT NULL',
        tags: 'VARCHAR(50)[]',
        address: {
            ipv4: 'VARCHAR(15)',
            ssh_port: 'INT',
            ipv6: 'VARCHAR(60)'
        },
        providers: 'JSONB',
        running_apps: 'INT DEFAULT 0',
        running_services: 'INT DEFAULT 0',
        cpu_cores: 'SMALLINT',
        mem_megabytes: 'INT',
        last_active_on: 'TIMESTAMP(3)',
        UNIQUE: ['type', 'name', 'account']
    },
    resource_performance: {
        create_on: 'TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP',
        resource_id: 'UUID NOT NULL',
        cpu: {
            count: 'SMALLINT',
            load: 'NUMERIC(3,1)',
            usr: 'NUMERIC(3,1)',
            sys: 'NUMERIC(3,1)',
            idle: 'NUMERIC(3,1)',
            irq: 'NUMERIC(3,1)',
            count_change: 'SMALLINT'
        },
        mem: {
            total: 'INT',
            free: 'INT',
            used: 'INT',
            active: 'INT',
            swaptotal: 'INT',
            swapused: 'INT',
            swapfree: 'INT',
            mem_change: 'INT',
            swap_change: 'INT'
        },
        proc: {
            all_processes: 'SMALLINT',
            running: 'SMALLINT',
            blocked: 'SMALLINT',
            sleeping: 'SMALLINT',
            all_change: 'SMALLINT'
        },
        maxCpuProc: {
            name: 'VARCHAR(30)',
            cpu: 'NUMERIC(6,1)',
            mem: 'NUMERIC(6,1)'
        },
        maxMemProc: {
            name: 'VARCHAR(30)',
            cpu: 'NUMERIC(6,1)',
            mem: 'NUMERIC(6,1)'
        },
        agentProc: {
            name: 'VARCHAR(30)',
            cpu: 'NUMERIC(6,1)',
            mem: 'NUMERIC(6,1)'
        },
        disk: {
            rx_sec: 'INT',
            wx_sec: 'INT',
            tx_sec: 'INT',
            rIO_sec: 'INT',
            wIO_sec: 'INT',
            tIO_sec: 'INT',
            added_devices_count: 'SMALLINT',
            removed_devices_count: 'SMALLINT',
            added_devices: 'VARCHAR(300)[]',
            removed_devices: 'VARCHAR(300)[]'
        },
        net: {
            totoal_interfaces: 'SMALLINT',
            total_change: 'SMALLINT',
            up_interfaces: 'SMALLINT',
            up_change: 'SMALLINT',
            active_interfaces: 'SMALLINT',
            rx_dropped: 'INT',
            rx_errors: 'INT',
            tx_dropped: 'INT',
            tx_errors: 'INT',
            rx_sec: 'INT',
            tx_sec: 'INT',
        },
        timespan_sec: 'NUMERIC(6,1)',
        checkAt: 'TIMESTAMP(3)',
        name: 'VARCHAR(200)',
        account: 'VARCHAR(50)',
        type: 'VARCHAR(100)'
    }
};
var SourceType;
(function (SourceType) {
    SourceType["git"] = "git";
})(SourceType = exports.SourceType || (exports.SourceType = {}));
var RepositoryDataStructure = (function (_super) {
    __extends(RepositoryDataStructure, _super);
    function RepositoryDataStructure() {
        var _this = _super.call(this) || this;
        _this.fs = null;
        _this.owner = null;
        _this.shoalUser = null;
        _this.tokenExpireInSeconds = 1800;
        return _this;
    }
    RepositoryDataStructure.prototype.setup = function (repoSettings) {
        return __awaiter(this, void 0, void 0, function () {
            var accountToCreate, i, accountInDB, account, extraProps, _i, extraProps_1, prop, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.setupDB((repoSettings.db.settings), exports.extraPostgresDBStruct)];
                    case 1:
                        _a.sent();
                        if (repoSettings.fs) {
                            this.fs = sardines_built_in_services_1.setupStorage(repoSettings.fs);
                        }
                        this.owner = repoSettings.owner;
                        accountToCreate = [this.owner];
                        if (repoSettings.shoalUser) {
                            this.shoalUser = repoSettings.shoalUser;
                            accountToCreate.push(this.shoalUser);
                        }
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 9, , 10]);
                        i = 0;
                        _a.label = 3;
                    case 3:
                        if (!(i < accountToCreate.length)) return [3, 8];
                        return [4, this.queryAccount(accountToCreate[i])];
                    case 4:
                        accountInDB = _a.sent();
                        if (!!accountInDB) return [3, 6];
                        account = accountToCreate[i];
                        accountInDB = Object.assign({}, account);
                        extraProps = ['can_login'];
                        if (i === 0)
                            Array.prototype.push.apply(extraProps, ['can_create_application', 'can_create_service', 'can_manage_repository', 'can_manage_accounts']);
                        for (_i = 0, extraProps_1 = extraProps; _i < extraProps_1.length; _i++) {
                            prop = extraProps_1[_i];
                            accountInDB[prop] = true;
                        }
                        return [4, this.createOrUpdateAccount(accountInDB)];
                    case 5:
                        accountInDB = _a.sent();
                        accountInDB = Object.assign(accountInDB, account);
                        if (i === 0)
                            this.owner = accountInDB;
                        else
                            this.shoalUser = accountInDB;
                        _a.label = 6;
                    case 6:
                        if (accountInDB) {
                            if (i === 0)
                                this.owner = accountInDB;
                            else
                                this.shoalUser = accountInDB;
                        }
                        _a.label = 7;
                    case 7:
                        i++;
                        return [3, 3];
                    case 8:
                        this.isInited = true;
                        console.log('repository initialized');
                        return [2, this.isInited];
                    case 9:
                        e_1 = _a.sent();
                        sardines_core_1.utils.inspectedDebugLog('ERROR when initializing repository:', e_1);
                        throw e_1;
                    case 10: return [2];
                }
            });
        });
    };
    RepositoryDataStructure.prototype.createAccount = function (username, password, token) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenObj;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.validateToken(token, true)];
                    case 1:
                        tokenObj = _a.sent();
                        if (!tokenObj) return [3, 3];
                        return [4, this.signUp({ name: username }, password)];
                    case 2: return [2, _a.sent()];
                    case 3: return [2, null];
                }
            });
        });
    };
    RepositoryDataStructure.prototype.checkAppPrivilege = function (appIdentity, token, account) {
        return __awaiter(this, void 0, void 0, function () {
            var appInst;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!account.can_create_application) {
                            throw sardines_core_1.utils.unifyErrMesg('Do not have privileges on creating or updating any application', 'repository', 'application');
                        }
                        return [4, this.queryApplication(appIdentity, token)];
                    case 1:
                        appInst = _a.sent();
                        if (appInst && appInst.owner_id !== account.id && account.id !== this.owner.id) {
                            throw sardines_core_1.utils.unifyErrMesg('Do not have privilege to update this application', 'repository', 'application');
                        }
                        return [2, appInst];
                }
            });
        });
    };
    RepositoryDataStructure.prototype.createOrUpdateApplication = function (application, token) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenObj, account, appInst;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.validateToken(token, true)];
                    case 1:
                        tokenObj = _a.sent();
                        return [4, this.queryAccount({ id: tokenObj.account_id })];
                    case 2:
                        account = _a.sent();
                        return [4, this.checkAppPrivilege(application, token, account)];
                    case 3:
                        appInst = _a.sent();
                        application.last_access_on = Date.now();
                        if (!appInst) return [3, 5];
                        return [4, this.db.set('application', application, { id: appInst.id })];
                    case 4:
                        _a.sent();
                        return [2, { id: appInst.id }];
                    case 5:
                        application.owner_id = account.id;
                        return [4, this.db.set('application', application)];
                    case 6: return [2, _a.sent()];
                }
            });
        });
    };
    RepositoryDataStructure.prototype.deleteApplication = function (application, token) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenObj, account, appInst;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.validateToken(token, true)];
                    case 1:
                        tokenObj = _a.sent();
                        return [4, this.queryAccount({ id: tokenObj.account_id })];
                    case 2:
                        account = _a.sent();
                        return [4, this.checkAppPrivilege(application, token, account)];
                    case 3:
                        appInst = _a.sent();
                        if (!appInst) return [3, 5];
                        return [4, this.db.set('application', null, { id: appInst.id })];
                    case 4: return [2, _a.sent()];
                    case 5: throw sardines_core_1.utils.unifyErrMesg('Application does not exist', 'repository', 'application');
                }
            });
        });
    };
    RepositoryDataStructure.prototype.queryApplication = function (application, token) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.validateToken(token, true)];
                    case 1:
                        _a.sent();
                        return [4, this.db.get('application', application)];
                    case 2: return [2, _a.sent()];
                }
            });
        });
    };
    RepositoryDataStructure.prototype.checkServicePrivilege = function (service, token, account) {
        return __awaiter(this, void 0, void 0, function () {
            var serviceQuery, serviceInst, appIdentity, appInst;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!account.can_create_service) {
                            throw sardines_core_1.utils.unifyErrMesg('Do not have privileges on creating or updating any service', 'repository', 'service');
                        }
                        serviceQuery = {};
                        if (service.application_id)
                            serviceQuery.application_id = service.application_id;
                        if (service.module)
                            serviceQuery.module = service.module;
                        if (service.name)
                            serviceQuery.name = service.name;
                        if (service.version)
                            serviceQuery.version = service.version;
                        return [4, this.queryService(serviceQuery, token)];
                    case 1:
                        serviceInst = _a.sent();
                        if (!serviceInst) return [3, 3];
                        appIdentity = null;
                        if (serviceInst.application_id)
                            appIdentity = { id: serviceInst.application_id };
                        else if (service.application)
                            appIdentity = { name: serviceInst.application };
                        if (!appIdentity)
                            throw sardines_core_1.utils.unifyErrMesg('Application setting is missing', 'repository', 'service');
                        return [4, this.queryApplication(appIdentity, token)];
                    case 2:
                        appInst = _a.sent();
                        if (!appInst) {
                            throw sardines_core_1.utils.unifyErrMesg('Invalid application setting', 'repository', 'service');
                        }
                        else if (account.id && account.id !== this.owner.id
                            && account.id !== appInst.owner_id && account.id !== serviceInst.owner
                            && appInst.developers && appInst.developers.indexOf(account.id) < 0
                            && serviceInst.developers && serviceInst.developers.indexOf(account.id) < 0) {
                            throw sardines_core_1.utils.unifyErrMesg('Do not have privilege to update this service', 'repository', 'service');
                        }
                        _a.label = 3;
                    case 3: return [2, serviceInst];
                }
            });
        });
    };
    RepositoryDataStructure.prototype.createOrUpdateService = function (serviceArg, token) {
        return __awaiter(this, void 0, void 0, function () {
            var res, i, resItem, service, tokenObj, account, serviceInst, appIdentity, appInst;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!Array.isArray(serviceArg)) return [3, 5];
                        res = [];
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < serviceArg.length)) return [3, 4];
                        return [4, this.createOrUpdateService(serviceArg[i], token)];
                    case 2:
                        resItem = _a.sent();
                        res.push(resItem);
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3, 1];
                    case 4: return [2, res];
                    case 5:
                        service = serviceArg;
                        return [4, this.validateToken(token, true)];
                    case 6:
                        tokenObj = _a.sent();
                        return [4, this.queryAccount({ id: tokenObj.account_id })];
                    case 7:
                        account = _a.sent();
                        return [4, this.checkServicePrivilege(service, token, account)];
                    case 8:
                        serviceInst = _a.sent();
                        service.last_access_on = Date.now();
                        if (!serviceInst) return [3, 10];
                        return [4, this.db.set('service', service, { id: serviceInst.id })];
                    case 9:
                        _a.sent();
                        return [2, { id: serviceInst.id }];
                    case 10:
                        if (!(service.application || service.application_id)) return [3, 16];
                        appIdentity = {};
                        if (service.application_id)
                            appIdentity.id = service.application_id;
                        else if (service.application)
                            appIdentity.name = service.application;
                        return [4, this.queryApplication(appIdentity, token)];
                    case 11:
                        appInst = _a.sent();
                        if (!(!appInst && account.can_create_application && !service.application_id)) return [3, 13];
                        return [4, this.createOrUpdateApplication(appIdentity, token)];
                    case 12:
                        appInst = _a.sent();
                        return [3, 14];
                    case 13:
                        if (!appInst && !account.can_create_application) {
                            throw sardines_core_1.utils.unifyErrMesg('Do not have privilege to create application', 'repository', 'service');
                        }
                        else if (!appInst && service.application_id) {
                            throw sardines_core_1.utils.unifyErrMesg('Invalid application id', 'repository', 'service');
                        }
                        _a.label = 14;
                    case 14:
                        serviceInst = Object.assign({ application_id: appInst.id, application: appInst.name }, service);
                        return [4, this.db.set('service', serviceInst)];
                    case 15: return [2, _a.sent()];
                    case 16: throw sardines_core_1.utils.unifyErrMesg('Can not create service without application setting', 'repository', 'service');
                }
            });
        });
    };
    RepositoryDataStructure.prototype.queryService = function (service, token, bypassToken, limit) {
        if (bypassToken === void 0) { bypassToken = false; }
        if (limit === void 0) { limit = 1; }
        return __awaiter(this, void 0, void 0, function () {
            var serviceQuery, version, appName, appInst, queryResult, orderby, distinctServiceNames, i, tmpService, orderby, tmpServiceQuery, serviceInst, _i, queryResult_1, serviceInst, i, argStr, pair;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!bypassToken) return [3, 2];
                        return [4, this.validateToken(token, true)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        serviceQuery = Object.assign({}, service);
                        version = serviceQuery.version;
                        if (!version || version === '*' || version.toLowerCase() === 'latest') {
                            version = '*';
                            delete serviceQuery.version;
                        }
                        appName = serviceQuery.application;
                        if (appName)
                            delete serviceQuery.application;
                        if (!!serviceQuery.application_id) return [3, 4];
                        return [4, this.db.get('application', { name: appName }, { create_on: -1 }, 1)];
                    case 3:
                        appInst = _a.sent();
                        if (appInst) {
                            appName = appInst.name;
                            serviceQuery.application_id = appInst.id;
                        }
                        else {
                            throw sardines_core_1.utils.unifyErrMesg('The application which the service claimed belonging to does not exist', 'repository', 'service');
                        }
                        _a.label = 4;
                    case 4:
                        if (serviceQuery.name === '*') {
                            delete serviceQuery.name;
                        }
                        if (serviceQuery.module === '*') {
                            delete serviceQuery.module;
                        }
                        queryResult = null;
                        if (!serviceQuery.version) return [3, 6];
                        return [4, this.db.get('service', serviceQuery, null, limit)];
                    case 5:
                        queryResult = _a.sent();
                        return [3, 14];
                    case 6:
                        if (!(serviceQuery.name && serviceQuery.module)) return [3, 8];
                        orderby = { create_on: -1 };
                        return [4, this.db.get('service', serviceQuery, orderby, 1)];
                    case 7:
                        queryResult = _a.sent();
                        return [3, 14];
                    case 8: return [4, this.db.get('service', serviceQuery, null, 0, 0, ['module', 'name'])];
                    case 9:
                        distinctServiceNames = _a.sent();
                        if (!distinctServiceNames) return [3, 14];
                        queryResult = [];
                        if (distinctServiceNames && !Array.isArray(distinctServiceNames)) {
                            distinctServiceNames = [distinctServiceNames];
                        }
                        i = 0;
                        _a.label = 10;
                    case 10:
                        if (!(i < distinctServiceNames.length)) return [3, 13];
                        tmpService = distinctServiceNames[i];
                        orderby = { create_on: -1 };
                        tmpServiceQuery = Object.assign(tmpService, serviceQuery);
                        return [4, this.db.get('service', tmpServiceQuery, orderby, 1)];
                    case 11:
                        serviceInst = _a.sent();
                        if (serviceInst) {
                            queryResult.push(serviceInst);
                        }
                        _a.label = 12;
                    case 12:
                        i++;
                        return [3, 10];
                    case 13:
                        if (queryResult.length === 0)
                            return [2, null];
                        _a.label = 14;
                    case 14:
                        if (!queryResult)
                            return [2, null];
                        if (!Array.isArray(queryResult)) {
                            queryResult = [queryResult];
                        }
                        for (_i = 0, queryResult_1 = queryResult; _i < queryResult_1.length; _i++) {
                            serviceInst = queryResult_1[_i];
                            if (serviceInst && serviceInst.is_public) {
                                serviceInst.application = appName;
                                delete serviceInst.create_on;
                                delete serviceInst.last_access_on;
                                delete serviceInst.owner_id;
                                delete serviceInst.developers;
                                if (typeof serviceInst.arguments === 'string') {
                                    serviceInst.arguments = serviceInst.arguments.match(/([a-z|A-Z|,]{2,})/g);
                                    for (i = serviceInst.arguments.length - 1; i >= 0; i--) {
                                        argStr = serviceInst.arguments[i];
                                        pair = argStr.split(',');
                                        serviceInst.arguments[i] = { name: pair[0], type: pair[1] };
                                    }
                                }
                            }
                        }
                        if (queryResult && queryResult.length === 1)
                            queryResult = queryResult[0];
                        return [2, queryResult];
                }
            });
        });
    };
    RepositoryDataStructure.prototype.deleteService = function (service, token) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenObj, account, serviceInst;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.validateToken(token, true)];
                    case 1:
                        tokenObj = _a.sent();
                        return [4, this.queryAccount({ id: tokenObj.account_id })];
                    case 2:
                        account = _a.sent();
                        return [4, this.checkServicePrivilege(service, token, account)];
                    case 3:
                        serviceInst = _a.sent();
                        if (!serviceInst) return [3, 5];
                        return [4, this.db.set('service', null, { id: serviceInst.id })];
                    case 4: return [2, _a.sent()];
                    case 5: throw sardines_core_1.utils.unifyErrMesg('Service does not exist', 'repository', 'service');
                }
            });
        });
    };
    RepositoryDataStructure.prototype.checkSourcePrivilege = function (source, token, account) {
        return __awaiter(this, void 0, void 0, function () {
            var sourceInst;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.querySource(source, token)];
                    case 1:
                        sourceInst = _a.sent();
                        if (!account)
                            return [2, null];
                        else
                            return [2, sourceInst];
                        return [2];
                }
            });
        });
    };
    RepositoryDataStructure.prototype.querySource = function (source, token, bypassToken) {
        if (bypassToken === void 0) { bypassToken = false; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!bypassToken) return [3, 2];
                        return [4, this.validateToken(token, true)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [4, this.db.get('source', source)];
                    case 3: return [2, _a.sent()];
                }
            });
        });
    };
    RepositoryDataStructure.prototype.createOrUpdateSource = function (source, token) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenObj, account, sourceInst;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.validateToken(token, true)];
                    case 1:
                        tokenObj = _a.sent();
                        return [4, this.queryAccount({ id: tokenObj.account_id })];
                    case 2:
                        account = _a.sent();
                        return [4, this.checkSourcePrivilege(source, token, account)];
                    case 3:
                        sourceInst = _a.sent();
                        source.last_access_on = Date.now();
                        if (!sourceInst) return [3, 5];
                        return [4, this.db.set('source', source, { id: sourceInst.id })];
                    case 4:
                        _a.sent();
                        return [2, { id: sourceInst.id }];
                    case 5: return [4, this.db.set('source', source)];
                    case 6: return [2, _a.sent()];
                }
            });
        });
    };
    RepositoryDataStructure.prototype.deleteSource = function (source, token) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenObj, account, sourceInst;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.validateToken(token, true)];
                    case 1:
                        tokenObj = _a.sent();
                        return [4, this.queryAccount({ id: tokenObj.account_id })];
                    case 2:
                        account = _a.sent();
                        return [4, this.checkSourcePrivilege(source, token, account)];
                    case 3:
                        sourceInst = _a.sent();
                        if (!sourceInst) return [3, 5];
                        return [4, this.db.set('source', null, { id: sourceInst.id })];
                    case 4: return [2, _a.sent()];
                    case 5: throw sardines_core_1.utils.unifyErrMesg('Source does not exist', 'repository', 'source');
                }
            });
        });
    };
    return RepositoryDataStructure;
}(sardines_built_in_services_1.PostgresTempleteAccount));
exports.RepositoryDataStructure = RepositoryDataStructure;
