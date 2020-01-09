import { Sardines } from 'sardines-core';
export interface SystemLoad {
    resource_id?: string;
    cpu: {
        count: number;
        load: number;
        usr: number;
        sys: number;
        idle: number;
        irq: number;
        count_change: number;
    };
    mem: {
        total: number;
        free: number;
        used: number;
        active: number;
        swaptotal: number;
        swapused: number;
        swapfree: number;
        mem_change: number;
        swap_change: number;
    };
    proc: {
        all_processes: number;
        running: number;
        blocked: number;
        sleeping: number;
        all_change: number;
    };
    maxCpuProc: {
        name: string;
        cpu: number;
        mem: number;
    } | {};
    maxMemProc: {
        name: string;
        cpu: number;
        mem: number;
    } | {};
    agentProc: {
        name: string;
        cpu: number;
        mem: number;
    } | {};
    disk: {
        rx_sec?: number;
        wx_sec?: number;
        tx_sec?: number;
        rIO_sec?: number;
        wIO_sec?: number;
        tIO_sec?: number;
        added_devices_count: number;
        removed_devices_count: number;
        added_devices: string[];
        removed_devices: string[];
    };
    net: {
        totoal_interfaces: number;
        total_change: number;
        up_interfaces: number;
        up_change: number;
        active_interfaces: number;
        rx_dropped: number;
        rx_errors: number;
        tx_dropped: number;
        tx_errors: number;
        rx_sec: number;
        tx_sec: number;
    } | {};
    timespan_sec: number;
    checkAt: number;
    name: string;
    account: string;
    type: Sardines.Runtime.ResourceType;
}
//# sourceMappingURL=system_load.d.ts.map