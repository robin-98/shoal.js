/*
 * Created by Robin Sun <robin@naturewake.com>
 * Created on 2019-12-26
 */

 import { SystemLoad } from './system_load'
 import { Sardines } from 'sardines-core'

export interface AgentState {
  hasHostStatStarted: boolean
  hasHostInfoUpdated: boolean
  providers: Sardines.Runtime.ProviderCache
  hostId: string|null
  perf: SystemLoad|null
  heartbeatRounds: number
}