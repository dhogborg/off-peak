import { createAsyncThunk } from '@reduxjs/toolkit'
import { handledFetch } from '../http'
import * as Types from './types'

export const getProfile = createAsyncThunk<
  Types.ProfileNode[],
  { priceArea: Types.Area; mga: string; from: Date; to: Date }
>('svk/getProfile', async (args) => {
  let mba = ''
  switch (args.priceArea) {
    case 'SE1':
      mba = '10Y1001A1001A44P'
      break
    case 'SE2':
      mba = '10Y1001A1001A45N'
      break
    case 'SE3':
      mba = '10Y1001A1001A46L'
      break
    case 'SE4':
      mba = '10Y1001A1001A47J'
      break
  }

  const params = new URLSearchParams()
  params.append('start', args.from.toJSON())
  params.append('end', args.to.toJSON())
  params.append('mba', mba)
  params.append('mga', args.mga)

  const url = `/api/v1/esettProfile?` + params.toString()

  const response = await handledFetch(url)
  const nodes = await response.json()

  return nodes.map((node) => {
    return {
      time: node.timestamp,
      value: Math.abs(node.quantity),
    }
  })
})
