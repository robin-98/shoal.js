"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sardines_core_1 = require("sardines-core");
var deployer_utils_1 = require("../deployer/deployer_utils");
exports.getRepositoryShoalUser = function (repoDeployPlan) {
    var account = null;
    if (repoDeployPlan && repoDeployPlan.applications && repoDeployPlan.applications.length) {
        repoDeployPlan.applications.forEach(function (item) {
            if (item.name === 'sardines' && item.init && item.init.length) {
                item.init.forEach(function (initItem) {
                    if (initItem.service
                        && initItem.service.module === '/repository'
                        && initItem.service.name === 'setup'
                        && initItem.arguments && initItem.arguments.length) {
                        if (initItem.arguments[0].shoalUser && initItem.arguments[0].shoalUser.name && initItem.arguments[0].shoalUser.password) {
                            account = {
                                name: initItem.arguments[0].shoalUser.name,
                                password: initItem.arguments[0].shoalUser.password
                            };
                        }
                    }
                });
            }
        });
    }
    return account;
};
exports.genSardinesConfigForAgent = function (repoDeployPlan) {
    var config = null;
    if (!repoDeployPlan)
        return config;
    var repoEntryAddresses = deployer_utils_1.getRepositoryEntiryAddressesFromDeployPlan(repoDeployPlan);
    var driversCache = {};
    repoEntryAddresses.forEach(function (item) {
        var driverName = '';
        if (typeof item.driver === 'object') {
            driverName = item.driver[sardines_core_1.Sardines.Platform.nodejs];
        }
        else if (typeof item.driver === 'string') {
            driverName = item.driver;
        }
        if (driverName && !driversCache[driverName])
            driversCache[driverName] = [item.protocol];
        else if (driverName && driversCache[driverName].indexOf(item.protocol) < 0) {
            driversCache[driverName].push(item.protocol);
        }
    });
    var shoalUser = exports.getRepositoryShoalUser(repoDeployPlan);
    if (shoalUser && repoEntryAddresses && repoEntryAddresses.length) {
        config = {
            application: 'sardines-shoal-agent',
            platform: sardines_core_1.Sardines.Platform.nodejs,
            repositoryEntries: repoEntryAddresses.map(function (item) { return ({ providerInfo: item, user: shoalUser.name, password: shoalUser.password }); }),
            drivers: Object.keys(driversCache).map(function (item) { return ({
                name: item,
                locationType: sardines_core_1.Sardines.LocationType.npm,
                protocols: driversCache[item]
            }); })
        };
    }
    return config;
};
