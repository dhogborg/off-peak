import React, { Component } from 'react'

import moment from 'moment'
import { Bar } from 'react-chartjs-2'
import * as chartjs from 'chart.js'

import { newDataset, RGB } from '../lib/chart'
import * as svk from '../lib/svk'
import * as tibber from '../lib/tibber'

type Props = {
  consumption: tibber.ConsumptionNode[]
  profile: svk.ProfileNode[]
}

type State = {
  options: chartjs.ChartOptions
}

export default class HistogramChart extends Component<Props, State> {
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
            id: 'Percentage',
            type: 'linear',
            position: 'left',
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

  consumptionHistogram(consumption: tibber.ConsumptionNode[]): chartjs.ChartDataSets {
    let absolutes: number[] = []
    for (let i = 0; i < 24; i++) {
      absolutes[i] = 0
    }

    let total = 0
    for (let c of consumption) {
      let timeOfDay = moment(c.from).hour()
      let consumed = c.consumption != null ? c.consumption : 0

      if (!absolutes[timeOfDay]) absolutes[timeOfDay] = 0
      absolutes[timeOfDay] += consumed
      total += consumed
    }

    let percentages = absolutes.map((v) => (v / total) * 100)
    return newDataset('Distribution of consumption [%]', RGB(0, 0, 0), {
      type: 'bar',
      yAxisID: 'Percentage',
      data: percentages,
    })
  }

  profileLine(profile: svk.ProfileNode[]): chartjs.ChartDataSets {
    let absolutes: number[] = []
    for (let i = 0; i < 24; i++) {
      absolutes[i] = 0
    }

    let total = 0
    for (let c of profile) {
      let timeOfDay = moment(c.time).hour()

      if (!absolutes[timeOfDay]) absolutes[timeOfDay] = 0
      absolutes[timeOfDay] += c.value
      total += c.value
    }

    let percentages = absolutes.map((v) => (v / total) * 100)
    return newDataset('Average household [%]', RGB(34, 89, 220), {
      type: 'line',
      yAxisID: 'Percentage',
      data: percentages,
    })
  }

  chartData(): chartjs.ChartData | undefined {
    let labels: string[] = []
    let absolutes: number[] = []
    for (let i = 0; i < 24; i++) {
      labels.push(i + ':00')
      absolutes[i] = 0
    }

    let datasets: chartjs.ChartDataSets[] = []
    if (this.props.consumption.length > 0) {
      datasets.push(this.consumptionHistogram(this.props.consumption))
    }
    if (this.props.profile.length > 0) {
      datasets.push(this.profileLine(this.props.profile))
    }

    return {
      labels,
      datasets,
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
