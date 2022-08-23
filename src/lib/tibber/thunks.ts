import { createAsyncThunk } from '@reduxjs/toolkit'

import * as auth from '../auth/auth'
import { errorString } from '../helpers'
import { handledFetch } from '../http'

import { Home, ConsumptionNode, PriceNode, Interval } from './types'

interface HomeResult {
  viewer: {
    homes: Home[]
  }
}

export const getHomes = createAsyncThunk<Home[], void>('tibber/getHomes', async () => {
  const result = await doRequest<HomeResult>(`{
    viewer {
      homes {
        id
        meteringPointData {
          gridCompany
          gridAreaCode
          priceAreaCode
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
  }`)
  return result.viewer.homes
})

interface ConsumptionResult {
  viewer: {
    home: {
      consumption: {
        nodes: ConsumptionNode[]
      }
    }
  }
}

export const getConsumption = createAsyncThunk<
  ConsumptionNode[],
  {
    homeId: string
    interval: Interval
    last?: number
  }
>('tibber/getConsumption', async (args) => {
  args = {
    last: 100,
    ...args,
  }

  const result = await doRequest<ConsumptionResult>(`{
      viewer {
        home(id: "${args.homeId}") {
          consumption(resolution: ${args.interval}, last: ${args.last}) {
            nodes {
              from
              to
              unitCost
              consumption
            }
          }
        }
      }
    }`)

  if (!result.viewer.home.consumption) {
    throw new Error('missing consumption data')
  }
  return result.viewer.home.consumption.nodes
})

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

export const getPrice = createAsyncThunk<
  PriceNode[],
  {
    homeId: string
    interval: Interval
    last?: number
  }
>('tibber/getPrice', async (args) => {
  args = {
    last: 100,
    ...args,
  }

  const result = await doRequest<PriceResult>(`{
    viewer {
      home(id: "${args.homeId}") {
        currentSubscription{
          priceInfo{
            range(resolution: ${args.interval}, last: ${args.last}){
              nodes{
                startsAt,
                total,
              }
            }
          }
        }
      }
    }
  }`)
  if (!result.viewer.home.currentSubscription.priceInfo.range) {
    throw new Error('no price data found in range')
  }
  return result.viewer.home.currentSubscription.priceInfo.range.nodes
})

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
    let response = await handledFetch('https://api.tibber.com/v1-beta/gql', init)
    let result: GQLResponse<T> = await response.json()
    return result.data
  } catch (err) {
    console.log(err)
    throw new Error('Query error: ' + errorString(err))
  }
}

interface GQLResponse<T = any> {
  data: T
}
