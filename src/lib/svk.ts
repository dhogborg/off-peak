import moment from 'moment'

import SN_ZIP from '../data/sn_zip.json'
import SN_CITY from '../data/sn_city.json'

/**
 * Currently, only SE0 region is supported
 * @param last the number of hours to retrive
 */
export async function getProfile(area: Area, last: number = 100) {
  const from = moment()
    .subtract(last, 'hours')
    .format('YYYY-MM-DD')
  const to = moment().format('YYYY-MM-DD')

  let url =
    `/api/v1/svkprofile` +
    `?periodFrom=${from}` +
    `&periodTo=${to}` +
    `&networkAreaIdString=${area}`

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

export function searchSN(zipcode: string, city: string): Area | undefined {
  if ((<any>SN_ZIP)[zipcode] && (<any>SN_ZIP)[zipcode] !== '') {
    return (<any>SN_ZIP)[zipcode] as Area
  }

  if ((<any>SN_CITY)[city] && (<any>SN_CITY)[city] !== '') {
    return (<any>SN_CITY)[city] as Area
  }

  return undefined
}

export enum Area {
  // All of sweden combined
  SN0 = 'SN0',
  // North of the north
  SN1 = 'SN1',
  // Not so northerly north
  SN2 = 'SN2',
  // Stockholm and Gbg
  SN3 = 'SN3',
  // The south
  SN4 = 'SN4',
}
