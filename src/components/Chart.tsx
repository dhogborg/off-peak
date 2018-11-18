import React, { Component } from 'react'

import moment from 'moment'
import { Bar, ChartData } from 'react-chartjs-2'
import * as chartjs from 'chart.js'
import * as tibber from '../lib/tibber'

type Props = {
  consumption: tibber.ConsumptionNode[]
  price: tibber.PriceNode[]
}

type State = {
  options: chartjs.ChartOptions
}

export default class Chart extends Component<Props, State> {
  readonly state: State = {
    options: {
      maintainAspectRatio: false,
      scales: {
        xAxes: [
          {
            barPercentage: 1.15,
          },
        ],
        yAxes: [
          {
            id: 'kWh',
            type: 'linear',
            position: 'left',
            ticks: {
              min: 0,
            },
          },
          {
            id: 'Currency',
            type: 'linear',
            position: 'right',
            ticks: {
              min: 0,
            },
          },
        ],
      },
    },
  }

  constructor(public readonly props: Props) {
    super(props)
  }

  chartData(): chartjs.ChartData | undefined {
    if (this.props.consumption.length == 0 || this.props.price.length == 0) {
      return undefined
    }

    let labels: string[] = []
    let consumptionSet: number[] = []
    let unitPriceSet: number[] = []

    for (let c of this.props.consumption) {
      // Chart labels, the date
      labels.push(moment(c.from).format('MM/DD'))
      // Amount payed per kWh this period
      // may differ from the unit price since billed by hour,
      // and unit price is an average of the price that day.
      unitPriceSet.push(c.unitPrice)
      // Amount of kWh consumed this period
      consumptionSet.push(c.consumption)
    }

    let averagePriceSet: number[] = []
    for (let p of this.props.price) {
      // Price of a kWh on average this day
      averagePriceSet.push(p.total)
    }

    let consumption = newDataset('Consumption [kWh]', RGB(0, 0, 0), {
      type: 'bar',
      yAxisID: 'kWh',
      data: consumptionSet,
      borderWidth: 0,
    })

    let unitPrice = newDataset('Paid [per kWh]', RGB(34, 89, 220), {
      type: 'line',
      yAxisID: 'Currency',
      data: unitPriceSet,
    })

    let averagePrice = newDataset('Spot price [per kWh]', RGB(206, 44, 30), {
      type: 'line',
      yAxisID: 'Currency',
      data: averagePriceSet,
    })

    return {
      labels,
      datasets: [consumption, unitPrice, averagePrice],
    }
  }

  render() {
    const data = this.chartData()
    if (!data) {
      return <div>Loading...</div>
    }

    return <Bar data={data} options={this.state.options} />
  }
}

// ----------------------------------
// Helper functions

const newDataset = (
  name: string,
  color?: ColorFn,
  options?: chartjs.ChartDataSets
): chartjs.ChartDataSets => {
  if (!color) {
    color = RGB(0, 0, 0)
  }
  let dataset: chartjs.ChartDataSets = {
    type: 'bar',
    label: name,
    backgroundColor: color(0.2),
    borderColor: color(1),
    borderWidth: 1,
    hoverBackgroundColor: color(0.4),
    hoverBorderColor: color(1),

    pointBackgroundColor: color(0.8),
    pointRadius: 0,
  }
  return { ...dataset, ...options }
}

type ColorFn = (opacity: number) => string
// Returns a function that returns the same (random) color each time
// called, with specefied opacity.
const RGB = (R: number, G: number, B: number): ColorFn => {
  let rgb = `${R}, ${G}, ${B}`
  return (opacity: number): string => {
    return `rgba(${rgb}, ${opacity})`
  }
}
