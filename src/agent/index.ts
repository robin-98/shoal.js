import { SardinesAgentInit, ServiceDeployPlan , Resource } from './agent_init'
export { agentStat } from './agent_init'

const agent = new SardinesAgentInit()

export const deployService = async(data: ServiceDeployPlan[]) => {
  return await agent.deployService(data)
}

export const startHost = async (hostInfo: Resource, heartbeatInterval: number = 1000) => {
  return await agent.startHost(hostInfo, heartbeatInterval)
}
