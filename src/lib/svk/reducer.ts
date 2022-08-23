import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store'

import * as Types from './types'
import * as thunks from './thunks'
import { parseCSV, ProfileNode } from '.'

export interface State {
  status: 'idle' | 'loading' | 'failed'
  error?: string

  nodes: ProfileNode[]
}

const initialState: State = {
  status: 'idle',
  nodes: [],
}

export const slice = createSlice({
  name: 'svk',
  initialState,

  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(thunks.getProfile.pending, (state, action) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(thunks.getProfile.fulfilled, (state, action) => {
        state.status = 'idle'
        state.nodes = parseCSV(action.payload)
      })
      .addCase(thunks.getProfile.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
  },
})

export const selector = (state: RootState) => state.svk

export default slice.reducer
