import { Resource } from './agent_init'
import { ServiceDeployPlan, SardinesAgentRuntime } from './agent_runtime'

const agent = new SardinesAgentRuntime()

export const agentState = agent.agentState

export const deployService = async(data: ServiceDeployPlan[]) => {
  return await agent.deployService(data)
}

export const startHost = async (hostInfo: Resource, heartbeatInterval: number = 1000) => {
  return await agent.startHost(hostInfo, heartbeatInterval)
}

export const removeServices = async(data: any) => {
  return await agent.removeServices(data)
}
