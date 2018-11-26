import { Bar } from 'react-chartjs-2'
import * as chartjs from 'chart.js'
import React, { Component } from 'react'

import { newDataset, RGB } from '../lib/chart'
import * as dataprep from '../lib/dataprep'

type Props = {
  days: dataprep.Day[]
}

type State = {
  options: chartjs.ChartOptions
}

export default class ConsumptionChart extends Component<Props, State> {
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
    let labels: string[] = this.props.days.map((day) => {
      return day.startTime.format('MM/DD')
    })

    let consumption = newDataset('Consumption [kWh]', RGB(0, 0, 0), {
      type: 'bar',
      yAxisID: 'kWh',
      data: this.props.days.map((day) => day.consumption),
      borderWidth: 0,
    })

    let unitPrice = newDataset('Paid [per kWh]', RGB(34, 89, 220), {
      type: 'line',
      yAxisID: 'Currency',
      data: this.props.days.map((day) => day.actualKwhPrice),
    })

    let profiled = newDataset('Spot price [per kWh]', RGB(206, 44, 30), {
      type: 'line',
      yAxisID: 'Currency',
      data: this.props.days.map((day) => day.potentialCost / day.consumption),
    })

    return {
      labels,
      datasets: [consumption, unitPrice, profiled],
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
