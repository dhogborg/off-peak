import React, { Component } from 'react'

import moment from 'moment'
import { Bar } from 'react-chartjs-2'
import * as chartjs from 'chart.js'

import { newDataset, RGB } from '../../../lib/chart'
import * as svk from '../../../lib/svk'
import * as tibber from '../../../lib/tibber'

type Props = {
  consumption: tibber.ConsumptionNode[]
  profile: svk.ProfileNode[]
}

export default function HistogramChart(props: Props) {
  const options: chartjs.ChartOptions = {
    tooltips: {
      callbacks: {
        label: function(tooltipItem: chartjs.ChartTooltipItem, data: chartjs.ChartData) {
          return Number(tooltipItem.yLabel).toFixed(2) + '%'
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
          id: 'Percentage',
          type: 'linear',
          position: 'left',
          ticks: {
            min: 0,
          },
          gridLines: {
            display: false,
          },
        },
      ],
    },
  }

  const consumptionHistogram = (consumption: tibber.ConsumptionNode[]): chartjs.ChartDataSets => {
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
    return newDataset('Konsumtionsmöster [%]', RGB(0, 0, 0), {
      type: 'bar',
      yAxisID: 'Percentage',
      data: percentages,
    })
  }

  const profileLine = (profile: svk.ProfileNode[]): number[] => {
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

    return absolutes.map((v) => (v / total) * 100)
  }

  const chartData = (): chartjs.ChartData | undefined => {
    let labels: string[] = []
    let absolutes: number[] = []
    for (let i = 0; i < 24; i++) {
      labels.push(i + ':00')
      absolutes[i] = 0
    }

    let datasets: chartjs.ChartDataSets[] = []
    if (props.consumption.length > 0) {
      datasets.push(consumptionHistogram(props.consumption))
    }
    if (props.profile.length > 0) {
      const days: { [key: string]: svk.ProfileNode[] } = {}
      for (let p of props.profile) {
        const d = moment(p.time).format('E')
        if (!days[d]) days[d] = []
        days[d].push(p)
      }
      const weekends = days['6'].concat(days['7'])
      const workdays = days['1'].concat(days['2'], days['3'], days['4'], days['5'])

      datasets.push(
        newDataset('Snitt (helger)', RGB(34, 89, 220), {
          type: 'line',
          yAxisID: 'Percentage',
          backgroundColor: 'rgba(0,0,0,0)',
          data: profileLine(weekends),
        })
      )

      datasets.push(
        newDataset('Snitt (arbetsdagar)', RGB(34, 89, 220), {
          type: 'line',
          yAxisID: 'Percentage',
          backgroundColor: 'rgba(0,0,0,0)',
          borderWidth: 2,
          data: profileLine(workdays),
        })
      )
    }

    return {
      labels,
      datasets,
    }
  }

  const data = chartData()
  if (!data) {
    return <div>Loading...</div>
  }

  return <Bar data={data} options={options} />
}
