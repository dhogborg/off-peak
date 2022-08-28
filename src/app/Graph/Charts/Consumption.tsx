import React from 'react'

import { Bar } from 'react-chartjs-2'
import * as chartjs from 'chart.js'

import { newDataset, RGB } from '../../../lib/chart'
import * as dataprep from '../../../lib/dataprep'

type Props = {
  days: dataprep.Day[]
}

export default function ConsumptionChart(props: Props) {
  const options: chartjs.ChartOptions = {
    tooltips: {
      callbacks: {
        label: function (tooltipItem: chartjs.ChartTooltipItem, data: chartjs.ChartData) {
          const n = Number(tooltipItem.yLabel).toFixed(2)
          if (data.datasets === undefined || tooltipItem.datasetIndex === undefined) {
            return n
          }
          const dataset = data.datasets[tooltipItem.datasetIndex]
          return dataset.label + ': ' + n + ' ' + dataset.yAxisID
        },
      },
    },
    legend: {
      labels: {
        filter: (legendItem: chartjs.ChartLegendLabelItem, data: chartjs.ChartData) => {
          switch (legendItem.datasetIndex) {
            case 1: // low price
            case 4: // peak price
              return null
            default:
              return legendItem
          }
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
          gridLines: {
            display: false,
          },
        },
      ],
    },
  }

  const chartData = (): chartjs.ChartData | undefined => {
    const labels: string[] = props.days.map((day) => {
      return day.startTime.format('DD/MM')
    })

    const consumption = newDataset('Konsumtion', RGB(0, 0, 0), {
      type: 'bar',
      yAxisID: 'kWh',
      data: props.days.map((day) => day.consumption),
      borderWidth: 0,
    })

    const unitPrice = newDataset('Du betalade', RGB(47, 184, 202), {
      type: 'line',
      yAxisID: 'SEK/kWh',
      backgroundColor: 'rgba(0,0,0,0)',
      borderWidth: 2,
      data: props.days.map((day) => day.actualKwhPrice),
    })

    const profiled = newDataset('Viktat spotpris', RGB(34, 89, 220), {
      type: 'line',
      yAxisID: 'SEK/kWh',
      backgroundColor: 'rgba(0,0,0,0)',
      borderWidth: 2,
      data: props.days.map((day) => day.potentialCost / day.consumption),
    })

    const peakPrice = newDataset('Högsta', RGB(129, 169, 253), {
      type: 'line',
      yAxisID: 'SEK/kWh',
      borderColor: 'rgba(0,0,0,0)',
      data: props.days.map((day) => day.pricePeak),
    })

    const troughPrice = newDataset('Lägsta', RGB(106, 213, 104), {
      type: 'line',
      yAxisID: 'SEK/kWh',
      backgroundColor: 'rgba(255,255,255,1)',
      borderColor: 'rgba(0,0,0,0)',
      data: props.days.map((day) => day.priceTrough),
    })

    return {
      labels,
      datasets: [consumption, troughPrice, unitPrice, profiled, peakPrice],
    }
  }

  const data = chartData()
  if (!data) {
    return <div>Laddar...</div>
  }

  return <Bar data={data} options={options} />
}
