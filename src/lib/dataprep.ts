import moment from 'moment'

import * as tibber from './tibber'
import * as svk from './svk'

export interface Aggregation {
  days: Day[]
  totalConsumption: number
  weightedAverage: number
}

export interface Day {
  // The time from for this day object
  startTime: moment.Moment
  endTime: moment.Moment
  // Total consumption in kWh
  consumption: number
  // SEK / kWH paid
  actualKwhPrice: number
  // Paid by customer
  totalCost: number
  // Would be cost if not metered by hour
  potentialCost: number
  // The highest price of the day
  pricePeak: number
  // The lowest price of the day
  priceTrough: number
}

interface Hour {
  time: moment.Moment
  consumption?: tibber.ConsumptionNode
  price?: tibber.PriceNode
  profile?: svk.ProfileNode
}

/**
 * Aggregates and sorts the 3 datasets into into a day-object
 * which can be used for further calculations.
 * @param consumption
 * @param price
 * @param profile
 */
export function aggregateDays(
  consumption: tibber.ConsumptionNode[],
  price: tibber.PriceNode[],
  profile: svk.ProfileNode[]
): Aggregation {
  const dateIndex: { [key: string]: Hour } = {}
  // Sort the price, consumption and the profile into a date-indexed map
  for (const p of price) {
    const time = moment(p.startsAt)
    const key = time.format()
    if (!dateIndex[key]) {
      dateIndex[key] = { time }
    }
    dateIndex[key].price = p
  }
  for (const p of consumption) {
    const time = moment(p.from)
    const key = time.format()
    if (!dateIndex[key]) {
      dateIndex[key] = { time }
    }
    dateIndex[key].consumption = p
  }
  for (const p of profile) {
    const time = moment(p.time)
    const key = time.format()
    if (!dateIndex[key]) {
      dateIndex[key] = { time }
    }
    dateIndex[key].profile = p
  }

  const cleanHours = Object.keys(dateIndex)
    .map((key) => dateIndex[key])
    .filter((hour) => {
      return hour.price !== undefined && hour.profile !== undefined
    })

  // Put them in 24-hour period bins
  const hourGroup: { [key: string]: Hour[] } = {}
  for (const i in dateIndex) {
    const hour = dateIndex[i]
    const key = hour.time.format('YYYY-MM-DD')
    if (!hourGroup[key]) {
      hourGroup[key] = []
    }
    hourGroup[key].push(hour)
  }

  // Compile 24-hour bins to Day-objects, with data ready to consume in diagrams
  const days: Day[] = []
  for (const h in hourGroup) {
    const hours = hourGroup[h]
    if (hours.length === 0) continue

    const consumptions = hours.map((hour) => hour.consumption)
    const prices = hours.map((hour) => hour.price)
    const profiles = hours.map((hour) => hour.profile)

    // Skip days where we are missing data. Most likely close to our boundaries.
    let valid = true
    for (let i = 0; i < consumptions.length; i++) {
      if (!consumptions[i] || !prices[i] || !profiles[i]) {
        valid = false
        break
      }
    }
    if (!valid) continue

    // extract raw numbers from the fetched data, without the metadata
    const consumption = consumptions.map((v) => {
      const c = v ? v.consumption : null
      return c != null ? c : 0
    })
    const price = prices.map((v) => {
      return v ? v.total : 0
    })
    const profile = profiles.map((v) => {
      return v ? v.value : 0
    })

    // Consumption in kWh.
    const totalConsumption = consumption.reduce((prev, curr) => prev + curr)

    // Total cost (paid) by us
    const totalCost = consumptions
      .map((v) => {
        const c = v ? v.unitCost : null
        return c != null ? c : 0
      })
      .reduce((prev, curr) => prev + curr)

    // Potential cost based on the profile of our utility area (SN1,2,3 or national average: SN0).
    const potentialCost = totalProfiledCost(consumption, price, profile)

    let pricePeak = 0
    let priceTrough = 999
    for (const p of price) {
      if (p > pricePeak) pricePeak = p
      if (p < priceTrough) priceTrough = p
    }

    days.push({
      startTime: hours[0].time,
      endTime: hours[hours.length - 1].time,
      consumption: totalConsumption,
      actualKwhPrice: totalCost / totalConsumption,
      potentialCost,
      totalCost,
      pricePeak,
      priceTrough,
    })
  }

  return {
    days,
    weightedAverage: weightedPeriodPrice(
      cleanHours.map((hour) => hour.price?.total || 0),
      cleanHours.map((hour) => hour.profile?.value || 0)
    ),
    totalConsumption: Sum(days.map((d) => d.consumption)),
  }
}

/**
 * Calculates the paid amount for a period of hours, preferably 24.
 * Non-hour metered customers are billed by hour according to the consumption of
 * all households not on hourly-metering. That consumption is published as
 * a hour-by-hour profile by Svenska Kraftnät:
 * https://mimer.svk.se/ConsumptionProfile/ConsumptionProfileIndex
 * @param consumption The consumption figures, per hour
 * @param prices The prices, per hour
 * @param profile The profile, also in hours.
 */
export function totalProfiledCost(
  consumption: number[],
  prices: number[],
  profile: number[]
): number {
  const totalConsumed = consumption.reduce((prev, value) => prev + value)
  const totalProfile = profile.reduce((prev, curr) => prev + curr)
  // Percentage of the total consumption consumed this particular hour
  const percent = profile.map((value) => value / totalProfile)

  let paid = 0
  for (let i = 0; i < prices.length; i++) {
    const hConsumed = totalConsumed * percent[i]
    const hPaid = hConsumed * prices[i]
    paid += hPaid
  }

  return paid
}

/**
 * Calculates and returns a weighted average for the entire
 * @param prices series of hourly prices
 * @param profile series of hourly weight data
 */
export function weightedPeriodPrice(prices: number[], profile: number[]): number {
  const totalProfile = Sum(profile)
  // calculate the percentage of which each price point will be weighted
  const percent = Percent(profile, totalProfile)

  // Aggregate the hourly prices and weight according to the profile
  const weightedAverage = prices.reduce((sum, price, i) => {
    return sum + price * percent[i]
  }, 0)

  return weightedAverage
}

function Sum(series: number[]): number {
  return series.reduce((prev, curr) => prev + curr, 0)
}

function Percent(series: number[], factor: number): number[] {
  return series.map((value) => value / factor)
}
