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
      tooltips: {
        callbacks: {
          label: function(tooltipItem: chartjs.ChartTooltipItem, data: chartjs.ChartData) {
            const n = Number(tooltipItem.yLabel).toFixed(2)
            if (data.datasets === undefined || tooltipItem.datasetIndex === undefined) {
              return n
            }
            const dataset = data.datasets[tooltipItem.datasetIndex]
            return dataset.label + ': ' + n + ' ' + dataset.yAxisID
          },
        },
      },
      maintainAspectRatio: false,
      scales: {
        xAxes: [
          {
            barPercentage: 1.15,
            gridLines: {
              display: false,
            },
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
            gridLines: {
              display: false,
            },
          },
          {
            id: 'SEK/kWh',
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
      return day.startTime.format('DD/MM')
    })

    let consumption = newDataset('Consumption', RGB(0, 0, 0), {
      type: 'bar',
      yAxisID: 'kWh',
      data: this.props.days.map((day) => day.consumption),
      borderWidth: 0,
    })

    let unitPrice = newDataset('You paid', RGB(47, 184, 202), {
      type: 'line',
      yAxisID: 'SEK/kWh',
      backgroundColor: 'rgba(0,0,0,0)',
      borderWidth: 2,
      data: this.props.days.map((day) => day.actualKwhPrice),
    })

    let profiled = newDataset('Spot price', RGB(34, 89, 220), {
      type: 'line',
      yAxisID: 'SEK/kWh',
      backgroundColor: 'rgba(0,0,0,0)',
      borderWidth: 2,
      data: this.props.days.map((day) => day.potentialCost / day.consumption),
    })

    let peakPrice = newDataset('Peak', RGB(129, 169, 253), {
      type: 'line',
      yAxisID: 'SEK/kWh',
      borderColor: 'rgba(0,0,0,0)',
      data: this.props.days.map((day) => day.pricePeak),
    })

    let troughPrice = newDataset('Low', RGB(106, 213, 104), {
      type: 'line',
      yAxisID: 'SEK/kWh',
      backgroundColor: 'rgba(255,255,255,1)',
      borderColor: 'rgba(0,0,0,0)',
      data: this.props.days.map((day) => day.priceTrough),
    })

    return {
      labels,
      datasets: [consumption, troughPrice, unitPrice, profiled, peakPrice],
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
