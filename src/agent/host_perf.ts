import * as si from 'systeminformation'
import * as proc from 'process'

export const maxNameLength = 30
export const maxDeviceSummaryLength = 300

export interface SystemLoad {
  cpu: { 
    count: number,
    load: number,
    user: number,
    sys: number,
    idle: number,
    irq: number,
    count_change: number
  },
  mem: {
    total: number,
    free: number,
    used: number,
    active: number,
    swaptotal: number,
    swapused: number,
    swapfree: number,
    mem_change: number,
    swap_change: number
  },
  proc: {
    all: number,
    running: number,
    blocked: number,
    sleeping: number,
    all_change: number
  },
  maxCpuProc: { 
    name: string,
    cpu: number,
    mem: number
  }|{},
  maxMemProc: {
    name: string,
    cpu: number,
    mem: number
  }|{},
  agentProc: {
    name: string,
    cpu: number,
    mem: number
  }|{},
  disk: {
    rx_sec?: number,
    wx_sec?: number,
    tx_sec?: number,
    rIO_sec?: number,
    wIO_sec?: number,
    tIO_sec?: number,
    added_devices_count: number,
    removed_devices_count: number,
    added_devices: string[],
    removed_devices: string[]
  },
  net: {
    totoal_interfaces: number,
    total_change: number,
    up_interfaces: number,
    up_change: number,
    active_interfaces: number,
    rx_dropped: number,
    rx_errors: number,
    tx_dropped: number,
    tx_errors: number,
    rx_sec: number,
    tx_sec: number,
  }|{},
  timespan_sec: number,
  checkAt: number
  host: string
}

let lastNetwork: any = null
let lastBlockDevices: {[key:string]:any}|null = null
let lastCpuCount: number = -1
let lastMemSize: number = -1
let lastSwapSize: number = -1
let lastProcCount: number = -1
let lastTimestamp: number = -1

export const getCurrentLoad = async (hostId: string): Promise<SystemLoad|null> => {
  // const now = Date.now()
  // CPU load
  const {currentload, currentload_user, currentload_system, currentload_idle, currentload_irq, cpus} =  await si.currentLoad()

  // Mem load
  const { total, free, used, active, swaptotal, swapused, swapfree } = await si.mem()
 
  // Processes
  const {all, running, blocked, sleeping, list } = await si.processes()
  
  const getProcInfo = (i:any) => ({
    name: i.name.substr(0, maxNameLength),
    cpu: i.pcpu,
    mem: i.pmem,
  })

  const maxCpuList = list.filter(i => i.pcpu > 0).sort((a,b) => a.pcpu - b.pcpu)
  const maxCpuProc = maxCpuList && maxCpuList.length > 0 ? maxCpuList.slice(-1).map(getProcInfo)[0] : {}

  const maxMemList = list.sort((a, b) => a.pmem - b.pmem)
  const maxMemProc = maxMemList && maxMemList.length > 0 ? maxMemList.slice(-1).map(getProcInfo)[0] : {}

  const selfProcList = list.filter(i=>i.pid === proc.pid)
  const agentProc = selfProcList && selfProcList.length > 0 ? selfProcList.map(getProcInfo)[0] : {}

  // Disk
  const { rx_sec, wx_sec, tx_sec } = await si.fsStats()
  const { rIO_sec, wIO_sec, tIO_sec } = await si.disksIO()

  let bd = await si.blockDevices()
  const summarizeDevice = (device: si.Systeminformation.BlockDevicesData):string => {
    return `mount:${device.mount};id:${device.identifier};size:${Math.round(device.size/1024/1024)}MB;${device.protocol};${device.physical};${device.model}`.substr(0,maxDeviceSummaryLength)
  }
  let addedDevices :string[]= []
  let removedDevices :string[]= []
  if (bd && !Array.isArray(bd)) bd = [bd]
  if (bd) {
    let bdCache: {[key:string]: any} = {}
    bd.forEach(i=> {
      bdCache[`${i.name}:${i.identifier}:${i.uuid}`] = i
    })
    if (!lastBlockDevices) lastBlockDevices = bdCache
    else {
      let tmpLastCache = Object.assign({}, lastBlockDevices)
      bd.forEach(i=> {
        let key = `${i.name}:${i.identifier}:${i.uuid}`
        if (!lastBlockDevices![key]) {
          addedDevices.push(summarizeDevice(i))
        } else {
          delete tmpLastCache[key]
        }
      })
      Object.keys(tmpLastCache).forEach(key => {
        removedDevices.push(summarizeDevice(lastBlockDevices![key]))
      })
      if (addedDevices.length > 0 || removedDevices.length > 0) {
        lastBlockDevices = bdCache
      }
    }
  }

  const disk = Object.assign((rx_sec < 0) ? {} : {
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
  })

  // Network
  let net: any = {}
  let netStat = await si.networkStats('*')
  const network: any = {}
  if (netStat && !Array.isArray(netStat)) netStat = [netStat]
  if (netStat) {
    network.totoal_interfaces = netStat.length
    network.up_interfaces = 0
    network.active_interfaces = 0
    netStat.forEach(i => {
      if (i.operstate === 'up') {
        network.up_interfaces++
        network.rx_dropped = (network.rx_dropped || 0) + i.rx_dropped
        network.rx_errors = (network.rx_errors || 0) + i.rx_errors
        network.tx_dropped = (network.tx_dropped || 0) + i.tx_dropped
        network.tx_errors = (network.tx_errors || 0) + i.tx_errors
        network.rx_sec = (network.rx_sec || 0) + (i.rx_sec < 0 ? 0 : Math.round(i.rx_sec))
        network.tx_sec = (network.tx_sec || 0) + (i.tx_sec < 0 ? 0 : Math.round(i.tx_sec))
        if (i.rx_sec > 0 || i.tx_sec > 0) network.active_interfaces++
      }
    })
    if (!lastNetwork) lastNetwork = network
    else {
      net = Object.assign({}, network)
      net.up_change = network.up_interfaces - lastNetwork.up_interfaces
      net.total_change = network.totoal_interfaces - lastNetwork.totoal_interfaces
      for (let prop of ['rx_dropped', 'rx_errors', 'tx_dropped', 'tx_errors']) {
        net[prop] = network[prop] - lastNetwork[prop]
      }
      lastNetwork = network
    }
  }
  // Result
  const cpuCnt = cpus && cpus.length > 0 ? cpus.length: 0
  const now = Date.now()
  const perf = { 
    cpu: {
      count: cpuCnt,
      load: Math.round(currentload*10)/10,
      user: Math.round(currentload_user*10)/10,
      sys: Math.round(currentload_system*10)/10,
      idle: Math.round(currentload_idle*10)/10,
      irq: Math.round(currentload_irq*10)/10,
      count_change: lastCpuCount < 0 ? 0 : cpuCnt - lastCpuCount
    },
    mem: { 
      total: Math.round(total/1024/1024), 
      free: Math.round(free/1024/1024), 
      used: Math.round(used/1024/1024), 
      active: Math.round(active/1024/1024), 
      swaptotal: Math.round(swaptotal/1024/1024), 
      swapused: Math.round(swapused/1024/1024), 
      swapfree: Math.round(swapfree/1024/1024),
      mem_change: lastMemSize < 0 ? 0 : Math.round(total/1024/1024) - lastMemSize,
      swap_change: lastSwapSize < 0 ? 0 : Math.round(swaptotal/1024/1024) - lastSwapSize
    }, 
    proc: {
      all, running, blocked, sleeping,
      all_change: lastProcCount < 0 ? 0 : all - lastProcCount
    },
    maxCpuProc,
    maxMemProc,
    agentProc,
    disk,
    net,
    timespan_sec: lastTimestamp < 0 ? 0 : Math.round((now - lastTimestamp)/100)/10,
    checkAt: now,
    host: hostId
  }
  lastCpuCount = perf.cpu.count
  lastMemSize = perf.mem.total
  lastSwapSize = perf.mem.swaptotal
  lastProcCount = perf.proc.all
  // Done
  if (lastTimestamp < 0) {
    lastTimestamp = now
    return null
  }
  lastTimestamp = now
  return perf
}

if (proc.argv[proc.argv.length - 1] === 'test') {
  getCurrentLoad('localhost').then(() => {
    setTimeout(()=>{
      getCurrentLoad('localhost').then(perf => {
        console.log(perf)
      })
    }, 3000)
  })
}
