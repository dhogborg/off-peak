import moment from 'moment'
import * as chartjs from 'chart.js'

import { newDataset, RGB } from '../../../lib/chart'
import * as svk from '../../../lib/svk'
import * as tibber from '../../../lib/tibber'

export const consumptionHistogram = (
  consumption: tibber.ConsumptionNode[]
): chartjs.ChartDataSets => {
  const absolutes: number[] = []
  for (let i = 0; i < 24; i++) {
    absolutes[i] = 0
  }

  let total = 0
  for (const c of consumption) {
    const timeOfDay = moment(c.from).hour()
    const consumed = c.consumption != null ? c.consumption : 0

    if (!absolutes[timeOfDay]) absolutes[timeOfDay] = 0
    absolutes[timeOfDay] += consumed
    total += consumed
  }

  const percentages = absolutes.map((v) => (v / total) * 100)
  return newDataset('Konsumtionsmöster [%]', RGB(0, 0, 0), {
    type: 'bar',
    yAxisID: 'Percentage',
    data: percentages,
  })
}

export const profileLine = (profile: svk.ProfileNode[]): number[] => {
  const absolutes: number[] = []
  for (let i = 0; i < 24; i++) {
    absolutes[i] = 0
  }

  let total = 0
  for (const c of profile) {
    const timeOfDay = moment(c.time).hour()

    if (!absolutes[timeOfDay]) absolutes[timeOfDay] = 0
    absolutes[timeOfDay] += c.value
    total += c.value
  }

  return absolutes.map((v) => (v / total) * 100)
}

export const meanPrice = (price: tibber.PriceNode[]): number[] => {
  const hours: { [key: number]: number[] } = {}
  price.forEach((node) => {
    const h = new Date(node.startsAt).getHours()
    if (!hours[h]) {
      hours[h] = []
    } else {
      hours[h].push(node.total)
    }
  })
  return Object.values(hours).map((values) => {
    const sum = Sum(values)
    return sum / values.length
  })
}

function Sum(values: number[]): number {
  return values.reduce((prev, curr) => {
    return prev + curr
  }, 0)
}
