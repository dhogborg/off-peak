import moment from 'moment'
import { errorString } from './helpers'

/**
 * Currently, only SE0 region is supported
 * @param last the number of hours to retrive
 */
export async function getProfile(area: Area, last: number = 100) {
  if (!area || area === '') {
    throw new Error('missing area code')
  }

  const from = moment()
    .subtract(last, 'hours')
    .format('YYYY-MM-DD')
  const to = moment().format('YYYY-MM-DD')

  let args = [`periodFrom=${from}`, `periodTo=${to}`, `networkAreaIdString=${area}`]
  let url = `/api/v1/svkprofile?` + args.join('&')

  try {
    let response = await fetch(url, {
      method: 'GET',
    })
    if (response.status != 200) {
      throw new Error(`${response.status} ${response.statusText}`)
    }

    let result = await response.text()
    return result
  } catch (err) {
    console.log(err)
    throw new Error('Unable to retrieve profile: ' + errorString(err))
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

export type Area = string
