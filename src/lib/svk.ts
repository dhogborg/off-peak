import moment from 'moment'

/**
 * Currently, only SE0 region is supported
 * @param last the number of hours to retrive
 */
export async function getProfile(last: number = 100) {
  const from = moment()
    .subtract(last, 'hours')
    .format('YYYY-MM-DD')
  const to = moment().format('YYYY-MM-DD')

  let url =
    `http://localhost:3001/` + // CORS wrapper. yeah, development only.
    `https://mimer.svk.se/` +
    `ConsumptionProfile/DownloadText` +
    `?groupByType=0` +
    `&periodFrom=${from}` +
    `&periodTo=${to}` +
    `&networkAreaIdString=SN0`

  const init: RequestInit = {
    method: 'GET',
  }
  try {
    let response = await fetch(url, init)
    let result = await response.text()
    return result
  } catch (err) {
    console.log(err)
    throw new Error('Unable to retrive profile: ' + err)
  }
}

export function parseCSV(csv: string) {
  let rows = csv.split('\n').slice(1)
  rows = rows.slice(0, rows.length - 2)

  let nodes: ProfileNode[] = []
  for (let row of rows) {
    let cols = row.split(';')
    let node = {
      time: cols[0],
      // Data is reported in negative values since they are
      // consumption numbers. Flip it for convenience.
      value: parseFloat(cols[1]) * -1,
    }
    nodes.push(node)
  }
  return nodes
}

export interface ProfileNode {
  time: string
  value: number
}
