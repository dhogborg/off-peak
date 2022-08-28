import { createAsyncThunk } from '@reduxjs/toolkit'

import * as Types from './types'
import { RootState } from '../store'
import { handledFetch } from '../http'

export const getOne = createAsyncThunk<Types.Snapshot, string>(
  'snapshots/getOne',
  async (id: string) => {
    const response = await handledFetch(`/api/v1/snapshots/${id}`)
    return await response.json()
  }
)

export const getAll = createAsyncThunk<
  Types.SnapshotPage,
  { homeId: string },
  { state: RootState }
>('snapshots/getAll', async (args) => {
  const response = await handledFetch(`/api/v1/snapshots/?home_id=${args.homeId}`)
  return await response.json()
})

interface SnapshotRef {
  id: string
}

export const add = createAsyncThunk<string, Types.CreateSnapshot>(
  'snapshots/add',
  async (snapshot: Types.CreateSnapshot) => {
    const response = await handledFetch('/api/v1/snapshots/', {
      method: 'POST',
      body: JSON.stringify(snapshot),
    })

    const result: SnapshotRef = await response.json()
    return result.id
  }
)
