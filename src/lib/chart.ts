import * as chartjs from 'chart.js'

export const newDataset = (
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

    pointHoverRadius: 5,
    pointHitRadius: 10,
    pointBackgroundColor: color(0.8),
    pointRadius: 0,
  }
  return { ...dataset, ...options }
}

type ColorFn = (opacity: number) => string
// Returns a function that returns the same (random) color each time
// called, with specefied opacity.
export const RGB = (R: number, G: number, B: number): ColorFn => {
  let rgb = `${R}, ${G}, ${B}`
  return (opacity: number): string => {
    return `rgba(${rgb}, ${opacity})`
  }
}
