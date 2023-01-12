import { createAsyncThunk } from '@reduxjs/toolkit'
import * as Sentry from '@sentry/react'

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
  if (!result?.viewer?.homes) {
    console.error('GQL result:', JSON.stringify(result))
    throw new Error('no homes found')
  }
  return result.viewer.homes
})

interface ConsumptionArgs extends RangeOptions {
  homeId: string
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

export const getConsumption = createAsyncThunk<ConsumptionNode[], ConsumptionArgs>(
  'tibber/getConsumption',
  async (args) => {
    const result = await doRequest<ConsumptionResult>(`{
      viewer {
        home(id: "${args.homeId}") {
          consumption(${rangeParameters(args)}) {
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

    if (!result?.viewer?.home?.consumption) {
      console.error('GQL result:', JSON.stringify(result))
      throw new Error('missing consumption data')
    }
    return result.viewer.home.consumption.nodes
  }
)

interface PriceArgs extends RangeOptions {
  homeId: string
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

export const getPrice = createAsyncThunk<PriceNode[], PriceArgs>(
  'tibber/getPrice',
  async (args) => {
    const result = await doRequest<PriceResult>(`{
    viewer {
      home(id: "${args.homeId}") {
        currentSubscription{
          priceInfo{
            range(${rangeParameters(args)}){
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
    if (!result?.viewer?.home?.currentSubscription?.priceInfo?.range?.nodes) {
      console.error('GQL result:', JSON.stringify(result))
      throw new Error('no price data found in range')
    }
    return result.viewer.home.currentSubscription.priceInfo.range.nodes
  }
)

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
    const response = await handledFetch('https://api.tibber.com/v1-beta/gql', init)
    const result: GQLResponse<T> = await response.json()

    if (result.errors && result.errors.length > 0) {
      result.errors.forEach((err, i) => {
        console.error(`GQL error ${i}: ${err.extensions.code}: ${err.message}`)
        Sentry.captureMessage(`GQL error: ${err.extensions.code}`, 'error')
      })
      throw new Error(result.errors[0].message)
    }

    return result.data
  } catch (err) {
    console.log(err)

    throw new Error('Query error: ' + errorString(err))
  }
}

// eslint-disable-next-line
interface GQLResponse<T = any> {
  data: T
  errors?: {
    message: string
    path: string[]
    extensions: { code: string }
  }[]
}

interface RangeOptions {
  resolution: Interval

  after?: Date
  before?: Date
  first?: number
  last?: number
}

function rangeParameters(args: RangeOptions): string {
  if (args.after && args.before) throw new Error('invalid combination: before && after')
  if (args.first && args.last) throw new Error('invalid combination: last && first')

  return Object.entries(args)
    .filter(([name, value]) => {
      if (value === undefined) return false
      // Allowlist with the args we are using as options
      return ['resolution', 'after', 'before', 'first', 'last'].indexOf(name) !== -1
    })
    .map<[string, string]>(([name, value]) => {
      if (value instanceof Date) {
        // Before / after on a hourly resolution is > and <, not >= and <=.
        // Decrease the timestamp by a millisecond to include the first or last hour we are looking for.
        switch (name) {
          case 'after':
            value = new Date(value.getTime() - 1)
            break
          case 'before':
            value = new Date(value.getTime() + 1)
            break
        }

        return [name, `"${btoa(value.toISOString())}"`]
      } else if (typeof value === 'number') {
        return [name, value.toFixed(0)]
      } else {
        value = '' + value
      }

      return [name, value]
    })
    .map(([name, value]) => {
      return `${name}: ${value}`
    })
    .join(', ')
}

function checkErr(result: any) {}
