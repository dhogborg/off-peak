import * as tibber from './tibber'
import * as svk from './svk'
import { errorString } from './helpers'

export interface Snapshot {
  id: string
  home: {
    area?: string // DEPRECATED, use priceAreaCode
    priceAreaCode: string
    gridAreaCode: string
  }
  consumptionNodes: tibber.ConsumptionNode[]
  priceNodes: tibber.PriceNode[]
  profileNodes: svk.ProfileNode[]
  created_at: string
}

export async function getSnapshot(id: string) {
  try {
    let response = await fetch(`/api/v1/snapshots/${id}`)
    if (response.status != 200) {
      throw new Error(`${response.status} ${response.statusText}`)
    }

    let result: Snapshot = await response.json()
    return result
  } catch (err) {
    throw new Error('Unable to get snapshot: ' + errorString(err))
  }
}

export interface SnapshotPage {
  snapshots: Snapshot[]
  count: number
}

export async function getSnapshots(homeId: string) {
  try {
    let response = await fetch(`/api/v1/snapshots/?home_id=${homeId}`)
    if (response.status != 200) {
      throw new Error(`${response.status} ${response.statusText}`)
    }

    let result: SnapshotPage = await response.json()
    return result
  } catch (err) {
    throw new Error('Unable to get snapshots: ' + errorString(err))
  }
}

interface SnapshotRef {
  id: string
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

export async function storeSnapshot(snapshot: CreateSnapshot) {
  const opts: RequestInit = {
    method: 'POST',
    body: JSON.stringify(snapshot),
  }

  try {
    let response = await fetch('/api/v1/snapshots/', opts)
    if (response.status != 200) {
      throw new Error(`${response.status} ${response.statusText}`)
    }

    let result: SnapshotRef = await response.json()
    return result.id
  } catch (err) {
    throw new Error('Unable to store snapshot: ' + errorString(err))
  }
}
