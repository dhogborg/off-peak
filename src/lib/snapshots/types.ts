import * as tibber from '../tibber'
import * as svk from '../svk'

export interface Snapshot {
  id: string
  home: {
    id: string
    priceAreaCode: string
    gridAreaCode: string
  }
  consumptionNodes?: tibber.ConsumptionNode[]
  priceNodes?: tibber.PriceNode[]
  profileNodes?: svk.ProfileNode[]
  created_at: string
}

export interface SnapshotPage {
  snapshots: Snapshot[]
  count: number
}

export interface CreateSnapshot {
  home: {
    id: string
    priceAreaCode: string
    gridAreaCode: string
  }
  consumptionNodes: tibber.ConsumptionNode[]
  priceNodes: tibber.PriceNode[]
  profileNodes: svk.ProfileNode[]
}
