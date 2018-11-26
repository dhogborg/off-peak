import moment from 'moment'

import * as tibber from './tibber'
import * as svk from './svk'

export interface Day {
  startTime: moment.Moment
  endTime: moment.Moment
  consumption: number
  actualKwhPrice: number
  potentialCost: number
  totalCost: number
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
): Day[] {
  const dateIndex: { [key: string]: Hour } = {}
  // Sort the price, consumption and the profile into a date-indexed map
  for (let p of price) {
    const time = moment(p.startsAt)
    const key = time.format()
    if (!dateIndex[key]) {
      dateIndex[key] = { time }
    }
    dateIndex[key].price = p
  }
  for (let p of consumption) {
    const time = moment(p.from)
    const key = time.format()
    if (!dateIndex[key]) {
      dateIndex[key] = { time }
    }
    dateIndex[key].consumption = p
  }
  for (let p of profile) {
    const time = moment(p.time)
    const key = time.format()
    if (!dateIndex[key]) {
      dateIndex[key] = { time }
    }
    dateIndex[key].profile = p
  }

  // Put them in 24-hour period bins
  const hourGroup: { [key: string]: Hour[] } = {}
  for (let i in dateIndex) {
    const hour = dateIndex[i]
    const key = hour.time.format('YYYY-MM-DD')
    if (!hourGroup[key]) {
      hourGroup[key] = []
    }
    hourGroup[key].push(hour)
  }

  // Compile 24-hour bins to Day-objects, with data ready to consume in diagrams
  const days: Day[] = []
  for (let h in hourGroup) {
    let hours = hourGroup[h]
    if (hours.length == 0) continue

    const consumptions = hours.map((hour) => hour.consumption)
    const prices = hours.map((hour) => hour.price)
    const profiles = hours.map((hour) => hour.profile)

    // Skip days where we are missing data. Most likley close to our boundaries.
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

    days.push({
      startTime: hours[0].time,
      endTime: hours[hours.length - 1].time,
      consumption: totalConsumption,
      actualKwhPrice: totalCost / totalConsumption,
      potentialCost,
      totalCost,
    })
  }

  return days
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
  // Percentage of the total consumption consumed this paticular hour
  const p = profile.map((value) => value / totalProfile)
  const paied = prices.reduce((prev, hourPrice, i) => {
    return prev + totalConsumed * p[i] * hourPrice
  })

  return paied
}

interface Hour {
  time: moment.Moment
  consumption?: tibber.ConsumptionNode
  price?: tibber.PriceNode
  profile?: svk.ProfileNode
}
