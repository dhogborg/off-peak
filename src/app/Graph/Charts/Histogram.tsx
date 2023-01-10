import moment from 'moment'
import { Bar } from 'react-chartjs-2'
import * as chartjs from 'chart.js'

import { newDataset, RGB } from '../../../lib/chart'
import * as svk from '../../../lib/svk'
import * as tibber from '../../../lib/tibber'

import { consumptionHistogram, meanPrice, profileLine } from './Histogram.lib'

type Props = {
  consumption: tibber.ConsumptionNode[]
  price: tibber.PriceNode[]
  profile: svk.ProfileNode[]
}

export default function HistogramChart(props: Props) {
  const options: chartjs.ChartOptions = {
    tooltips: {
      callbacks: {
        label: function (tooltipItem: chartjs.ChartTooltipItem, data: chartjs.ChartData) {
          switch (tooltipItem.datasetIndex) {
            case 0:
            case 1:
            case 2:
              return Number(tooltipItem.yLabel).toFixed(2) + '%'
            case 3:
              return Number(tooltipItem.yLabel).toFixed(2) + ' SEK/kWh'
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
    const labels: string[] = []
    const absolutes: number[] = []
    for (let i = 0; i < 24; i++) {
      labels.push(i + ':00')
      absolutes[i] = 0
    }

    const datasets: chartjs.ChartDataSets[] = []
    if (props.consumption.length > 0) {
      datasets.push(consumptionHistogram(props.consumption))
    }
    if (props.profile.length > 0) {
      const days: { [key: string]: svk.ProfileNode[] } = {
        '1': [],
        '2': [],
        '3': [],
        '4': [],
        '5': [],
        '6': [],
        '7': [],
      }
      for (const p of props.profile) {
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

      datasets.push(
        newDataset('Snittpris', RGB(47, 184, 202), {
          type: 'line',
          yAxisID: 'SEK/kWh',
          backgroundColor: 'rgba(0,0,0,0)',
          borderWidth: 2,
          data: meanPrice(props.price),
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
