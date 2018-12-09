import * as auth from './auth'

export async function getHomes() {
  const query = `{
    viewer {
      homes {
        id
        meteringPointData {
          gridCompany
        }
        address {
          address1
          address2
          address3
          postalCode
          city
          country
        }
      }
    }
  }`
  const result = await doRequest<HomeResult>(query)
  return result.viewer.homes
}

export interface Home {
  id: string
  meteringPointData: {
    gridCompany: string
  }
  address: Address
}

export interface Address {
  address1: string
  address2: string
  address3: string
  postalCode: string
  city: string
  country: string
}

interface HomeResult {
  viewer: {
    homes: Home[]
  }
}

export async function getConsumption(homeId: string, interval: Interval, last: number = 100) {
  let query = `
    {
        viewer {
          home(id: "${homeId}") {
            consumption(resolution: ${interval}, last: ${last}) {
              nodes {
                from
                to
                unitCost
                consumption
              }
            }
          }
        }
      }`

  const result = await doRequest<ConsumptionResult>(query)
  return result.viewer.home.consumption.nodes
}

export interface ConsumptionNode {
  from: string
  to: string
  unitCost: number | null
  consumption: number | null
}

interface ConsumptionResult {
  viewer: {
    home: {
      consumption: {
        nodes: ConsumptionNode[]
      }
    }
  }
}

export async function getPrice(homeId: string, interval: Interval, last: number = 100) {
  let query = `
  {
    viewer {
      home(id: "${homeId}") {
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
  const result = await doRequest<PriceResult>(query)
  return result.viewer.home.currentSubscription.priceInfo.range.nodes
}

export interface PriceNode {
  startsAt: string
  total: number
}

interface PriceResult {
  viewer: {
    home: {
      currentSubscription: {
        priceInfo: {
          range: {
            nodes: PriceNode[]
          }
        }
      }
    }
  }
}

async function doRequest<T>(query: string) {
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
    if (response.status != 200) {
      throw new Error(`${response.status} ${response.statusText}`)
    }

    let result: GQLResponse<T> = await response.json()
    return result.data
  } catch (err) {
    console.log(err)
    throw new Error('Query error: ' + err)
  }
}

export enum Interval {
  Hourly = 'HOURLY',
  Daily = 'DAILY',
  Monthly = 'MONTLY',
}

interface GQLResponse<T = any> {
  data: T
}
