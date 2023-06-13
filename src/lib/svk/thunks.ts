import { createAsyncThunk } from '@reduxjs/toolkit'
import moment from 'moment'
import { PeriodTypes } from '../config'
import { handledFetch } from '../http'
import * as Types from './types'

/**
 * @param last the number of hours to retrive
 */
export const getProfile = createAsyncThunk<string, { area: Types.Area; period: PeriodTypes }>(
  'svk/getProfile',
  async (args) => {
    const { from, to } = ((): { from: string; to: string } => {
      const YYMMDD = 'YYYY-MM-DD'
      switch (args.period) {
        case 'last-year': {
          const startLastYear = moment().startOf('year').subtract(1, 'year').date(1).hour(0).minute(0).second(0)
          const endLastYear = moment(startLastYear)
            .add(1, 'year')
            .subtract(1, 'day')
            .hour(0)
            .minute(0)
            .second(0)
          return {
            from: startLastYear.format(YYMMDD),
            to: endLastYear.format(YYMMDD),
          }
        }
        case 'this-year':
          return {
            from: moment().startOf('year').format(YYMMDD),
            to: moment().format(YYMMDD),
          }
        case 'running-year':
          return {
            from: moment()
              .subtract(365 * 24, 'hours')
              .format(YYMMDD),
            to: moment().format(YYMMDD),
          }
        case 'last-month': {
          const startLastMonth = moment().subtract(1, 'month').date(1).hour(0).minute(0).second(0)
          const endLastMonth = moment(startLastMonth)
            .add(1, 'month')
            .subtract(1, 'day')
            .hour(0)
            .minute(0)
            .second(0)
          return {
            from: startLastMonth.format(YYMMDD),
            to: endLastMonth.format(YYMMDD),
          }
        }
        case 'this-month':
          return {
            from: moment().date(1).format(YYMMDD),
            to: moment().format(YYMMDD),
          }
        case 'rolling':
          return {
            from: moment()
              .subtract(33 * 24, 'hours')
              .format(YYMMDD),
            to: moment().format(YYMMDD),
          }
      }
    })()

    console.log({ from, to })
    if (from === '1970-01-01') {
      throw new Error('invalid start date')
    }

    const params = [`periodFrom=${from}`, `periodTo=${to}`, `networkAreaIdString=${args.area}`]
    const url = `/api/v1/svkprofile?` + params.join('&')

    const response = await handledFetch(url, {
      method: 'GET',
    })

    return await response.text()
  }
)

export function parseCSV(csv: string) {
  let rows = csv.split('\n').slice(1)
  rows = rows.slice(0, rows.length - 2)

  const nodes: Types.ProfileNode[] = []
  for (const row of rows) {
    const cols = row.split(';')
    const node = {
      time: cols[0],
      // Data is reported in negative values since they are
      // consumption numbers. Flip it for convenience.
      value: parseFloat(cols[1]) * -1,
    }
    nodes.push(node)
  }
  return nodes
}
