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
var si = require("systeminformation");
var proc = require("process");
var sardines_core_1 = require("sardines-core");
exports.maxNameLength = 30;
exports.maxDeviceSummaryLength = 300;
var lastNetwork = null;
var lastBlockDevices = null;
var lastCpuCount = -1;
var lastMemSize = -1;
var lastSwapSize = -1;
var lastProcCount = -1;
var lastTimestamp = -1;
exports.getCurrentLoad = function (hostname, account, type) {
    if (type === void 0) { type = sardines_core_1.Sardines.Runtime.ResourceType.host; }
    return __awaiter(void 0, void 0, void 0, function () {
        var _a, currentload, currentload_user, currentload_system, currentload_idle, currentload_irq, cpus, _b, total, free, used, active, swaptotal, swapused, swapfree, _c, all, running, blocked, sleeping, list, getProcInfo, maxCpuList, maxCpuProc, maxMemList, maxMemProc, selfProcList, agentProc, _d, rx_sec, wx_sec, tx_sec, _e, rIO_sec, wIO_sec, tIO_sec, bd, summarizeDevice, addedDevices, removedDevices, bdCache_1, tmpLastCache_1, disk, net, netStat, network, _i, _f, prop, cpuCnt, now, perf;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0: return [4, si.currentLoad()];
                case 1:
                    _a = _g.sent(), currentload = _a.currentload, currentload_user = _a.currentload_user, currentload_system = _a.currentload_system, currentload_idle = _a.currentload_idle, currentload_irq = _a.currentload_irq, cpus = _a.cpus;
                    return [4, si.mem()];
                case 2:
                    _b = _g.sent(), total = _b.total, free = _b.free, used = _b.used, active = _b.active, swaptotal = _b.swaptotal, swapused = _b.swapused, swapfree = _b.swapfree;
                    return [4, si.processes()];
                case 3:
                    _c = _g.sent(), all = _c.all, running = _c.running, blocked = _c.blocked, sleeping = _c.sleeping, list = _c.list;
                    getProcInfo = function (i) { return ({
                        name: i.name.substr(0, exports.maxNameLength),
                        cpu: i.pcpu,
                        mem: i.pmem,
                    }); };
                    maxCpuList = list.filter(function (i) { return i.pcpu > 0; }).sort(function (a, b) { return a.pcpu - b.pcpu; });
                    maxCpuProc = maxCpuList && maxCpuList.length > 0 ? maxCpuList.slice(-1).map(getProcInfo)[0] : {};
                    maxMemList = list.sort(function (a, b) { return a.pmem - b.pmem; });
                    maxMemProc = maxMemList && maxMemList.length > 0 ? maxMemList.slice(-1).map(getProcInfo)[0] : {};
                    selfProcList = list.filter(function (i) { return i.pid === proc.pid; });
                    agentProc = selfProcList && selfProcList.length > 0 ? selfProcList.map(getProcInfo)[0] : {};
                    return [4, si.fsStats()];
                case 4:
                    _d = _g.sent(), rx_sec = _d.rx_sec, wx_sec = _d.wx_sec, tx_sec = _d.tx_sec;
                    return [4, si.disksIO()];
                case 5:
                    _e = _g.sent(), rIO_sec = _e.rIO_sec, wIO_sec = _e.wIO_sec, tIO_sec = _e.tIO_sec;
                    return [4, si.blockDevices()];
                case 6:
                    bd = _g.sent();
                    summarizeDevice = function (device) {
                        return ("mount:" + device.mount + ";id:" + device.identifier + ";size:" + Math.round(device.size / 1024 / 1024) + "MB;" + device.protocol + ";" + device.physical + ";" + device.model).substr(0, exports.maxDeviceSummaryLength);
                    };
                    addedDevices = [];
                    removedDevices = [];
                    if (bd && !Array.isArray(bd))
                        bd = [bd];
                    if (bd) {
                        bdCache_1 = {};
                        bd.forEach(function (i) {
                            bdCache_1[i.name + ":" + i.identifier + ":" + i.uuid] = i;
                        });
                        if (!lastBlockDevices)
                            lastBlockDevices = bdCache_1;
                        else {
                            tmpLastCache_1 = Object.assign({}, lastBlockDevices);
                            bd.forEach(function (i) {
                                var key = i.name + ":" + i.identifier + ":" + i.uuid;
                                if (!lastBlockDevices[key]) {
                                    addedDevices.push(summarizeDevice(i));
                                }
                                else {
                                    delete tmpLastCache_1[key];
                                }
                            });
                            Object.keys(tmpLastCache_1).forEach(function (key) {
                                removedDevices.push(summarizeDevice(lastBlockDevices[key]));
                            });
                            if (addedDevices.length > 0 || removedDevices.length > 0) {
                                lastBlockDevices = bdCache_1;
                            }
                        }
                    }
                    disk = Object.assign((rx_sec < 0) ? {} : {
                        rx_sec: Math.round(rx_sec),
                        wx_sec: Math.round(wx_sec),
                        tx_sec: Math.round(tx_sec),
                        rIO_sec: Math.round(rIO_sec),
                        wIO_sec: Math.round(wIO_sec),
                        tIO_sec: Math.round(tIO_sec)
                    }, {
                        added_devices_count: addedDevices.length,
                        removed_devices_count: removedDevices.length,
                        added_devices: addedDevices,
                        removed_devices: removedDevices
                    });
                    net = {};
                    return [4, si.networkStats('*')];
                case 7:
                    netStat = _g.sent();
                    network = {};
                    if (netStat && !Array.isArray(netStat))
                        netStat = [netStat];
                    if (netStat) {
                        network.totoal_interfaces = netStat.length;
                        network.up_interfaces = 0;
                        network.active_interfaces = 0;
                        netStat.forEach(function (i) {
                            if (i.operstate === 'up') {
                                network.up_interfaces++;
                                network.rx_dropped = (network.rx_dropped || 0) + i.rx_dropped;
                                network.rx_errors = (network.rx_errors || 0) + i.rx_errors;
                                network.tx_dropped = (network.tx_dropped || 0) + i.tx_dropped;
                                network.tx_errors = (network.tx_errors || 0) + i.tx_errors;
                                network.rx_sec = (network.rx_sec || 0) + (i.rx_sec < 0 ? 0 : Math.round(i.rx_sec));
                                network.tx_sec = (network.tx_sec || 0) + (i.tx_sec < 0 ? 0 : Math.round(i.tx_sec));
                                if (i.rx_sec > 0 || i.tx_sec > 0)
                                    network.active_interfaces++;
                            }
                        });
                        if (!lastNetwork)
                            lastNetwork = network;
                        else {
                            net = Object.assign({}, network);
                            net.up_change = network.up_interfaces - lastNetwork.up_interfaces;
                            net.total_change = network.totoal_interfaces - lastNetwork.totoal_interfaces;
                            for (_i = 0, _f = ['rx_dropped', 'rx_errors', 'tx_dropped', 'tx_errors']; _i < _f.length; _i++) {
                                prop = _f[_i];
                                net[prop] = network[prop] - lastNetwork[prop];
                            }
                            lastNetwork = network;
                        }
                    }
                    cpuCnt = cpus && cpus.length > 0 ? cpus.length : 0;
                    now = Date.now();
                    perf = {
                        cpu: {
                            count: cpuCnt,
                            load: Math.round(currentload * 10) / 10,
                            usr: Math.round(currentload_user * 10) / 10,
                            sys: Math.round(currentload_system * 10) / 10,
                            idle: Math.round(currentload_idle * 10) / 10,
                            irq: Math.round(currentload_irq * 10) / 10,
                            count_change: lastCpuCount < 0 ? 0 : cpuCnt - lastCpuCount
                        },
                        mem: {
                            total: Math.round(total / 1024 / 1024),
                            free: Math.round(free / 1024 / 1024),
                            used: Math.round(used / 1024 / 1024),
                            active: Math.round(active / 1024 / 1024),
                            swaptotal: Math.round(swaptotal / 1024 / 1024),
                            swapused: Math.round(swapused / 1024 / 1024),
                            swapfree: Math.round(swapfree / 1024 / 1024),
                            mem_change: lastMemSize < 0 ? 0 : Math.round(total / 1024 / 1024) - lastMemSize,
                            swap_change: lastSwapSize < 0 ? 0 : Math.round(swaptotal / 1024 / 1024) - lastSwapSize
                        },
                        proc: {
                            all_processes: all, running: running, blocked: blocked, sleeping: sleeping,
                            all_change: lastProcCount < 0 ? 0 : all - lastProcCount
                        },
                        maxCpuProc: maxCpuProc,
                        maxMemProc: maxMemProc,
                        agentProc: agentProc,
                        disk: disk,
                        net: net,
                        timespan_sec: lastTimestamp < 0 ? 0 : Math.round((now - lastTimestamp) / 100) / 10,
                        checkAt: now,
                        name: hostname,
                        account: account,
                        type: type
                    };
                    lastCpuCount = perf.cpu.count;
                    lastMemSize = perf.mem.total;
                    lastSwapSize = perf.mem.swaptotal;
                    lastProcCount = perf.proc.all_processes;
                    lastTimestamp = now;
                    return [2, perf];
            }
        });
    });
};
if (proc.argv[proc.argv.length - 1] === 'test') {
    exports.getCurrentLoad('localhost', 'unknown').then(function () {
        setTimeout(function () {
            exports.getCurrentLoad('localhost', 'unknown').then(function (perf) {
                console.log(perf);
            });
        }, 3000);
    });
}
