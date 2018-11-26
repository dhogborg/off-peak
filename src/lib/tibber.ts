import * as auth from './auth'

interface GQLResponse<T = any> {
  data: T
}

export interface ConsumptionNode {
  from: string
  to: string
  totalCost: number | null
  unitCost: number | null
  unitPrice: number
  unitPriceVAT: number
  consumption: number | null
  consumptionUnit: string
}

interface ConsumptionResult {
  viewer: {
    homes: {
      consumption: {
        nodes: ConsumptionNode[]
      }
    }[]
  }
}
export async function getConsumption(interval: Interval, last: number = 100) {
  let query = `
    {
        viewer {
          homes {
            consumption(resolution: ${interval}, last: ${last}) {
              nodes {
                from
                to
                totalCost
                unitCost
                unitPrice
                unitPriceVAT
                consumption
                consumptionUnit
              }
            }
          }
        }
      }`

  const init: RequestInit = {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + auth.getToken(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: query,
    }),
  }
  try {
    let response = await fetch('https://api.tibber.com/v1-beta/gql', init)
    let result: GQLResponse<ConsumptionResult> = await response.json()
    return result.data.viewer.homes[0].consumption.nodes
  } catch (err) {
    console.log(err)
    throw new Error('Unable to load consumption: ' + err)
  }

  return []
}

export interface PriceNode {
  startsAt: string
  total: number
}
interface PriceResult {
  viewer: {
    homes: {
      currentSubscription: {
        priceInfo: {
          range: {
            nodes: PriceNode[]
          }
        }
      }
    }[]
  }
}

export async function getPrice(interval: Interval, last: number = 100) {
  let query = `
  {
    viewer {
      homes {
        currentSubscription{
          priceInfo{
            range(resolution: ${interval}, last: ${last}){
              nodes{
                startsAt,
                total,
              }
            }
          }
        }
      }
    }
  }
  `

  const init: RequestInit = {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + auth.getToken(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: query,
    }),
  }
  try {
    let response = await fetch('https://api.tibber.com/v1-beta/gql', init)
    let result: GQLResponse<PriceResult> = await response.json()
    return result.data.viewer.homes[0].currentSubscription.priceInfo.range.nodes
  } catch (err) {
    console.log(err)
    throw new Error('Unable to load price data: ' + err)
  }

  return []
}

export enum Interval {
  Hourly = 'HOURLY',
  Daily = 'DAILY',
  Monthly = 'MONTLY',
}
