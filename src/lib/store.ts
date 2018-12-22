import * as tibber from './tibber'
import * as svk from './svk'

export interface Snapshot {
  home: {
    id: string
    area?: string // DEPRECATED, use priceAreaCode
    priceAreaCode: string
    gridAreaCode: string
  }
  consumptionNodes: tibber.ConsumptionNode[]
  priceNodes: tibber.PriceNode[]
  profileNodes: svk.ProfileNode[]
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
    throw new Error('Unable to get snapshot: ' + err.message)
  }
}

interface SnapshotRef {
  id: string
}

export async function storeSnapshot(snapshot: Snapshot) {
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
    throw new Error('Unable to store snapshot: ' + err.message)
  }
}
