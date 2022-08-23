import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store'

import * as Types from './types'
import * as thunks from './thunks'

export interface State {
  status: 'idle' | 'loading' | 'failed'
  error?: string

  items: {
    [key: string]: {
      snapshot: Types.Snapshot

      status: 'idle' | 'loading' | 'failed'
      error?: string

      owner?: boolean
    }
  }

  addStatus: 'idle' | 'loading' | 'failed'
  addId?: string
  addError?: string
}

const initialState: State = {
  status: 'idle',
  items: {},

  addStatus: 'idle',
}

export const slice = createSlice({
  name: 'snapshots',
  initialState,

  reducers: {
    reset: (state) => {
      state.addId = undefined
      state.addError = undefined
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(thunks.getOne.pending, (state, action) => {
        const existing = state.items[action.meta.arg]
        state.items[action.meta.arg] = {
          ...existing,
          status: 'loading',
          error: undefined,
        }
      })
      .addCase(thunks.getOne.fulfilled, (state, action) => {
        const existing = state.items[action.meta.arg]
        state.items[action.meta.arg] = {
          ...existing,
          status: 'idle',
          snapshot: action.payload,
        }
      })
      .addCase(thunks.getOne.rejected, (state, action) => {
        const existing = state.items[action.meta.arg]
        state.items[action.meta.arg] = {
          ...existing,
          status: 'failed',
          error: action.error.message,
        }
      })

      .addCase(thunks.getAll.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(thunks.getAll.fulfilled, (state, action) => {
        state.status = 'idle'
        action.payload.snapshots.forEach(
          (s) =>
            (state.items[s.id] = {
              status: 'idle',
              snapshot: s,
              owner: true,
            })
        )
      })
      .addCase(thunks.getAll.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })

      .addCase(thunks.add.pending, (state) => {
        state.addStatus = 'loading'
        state.addError = undefined
      })
      .addCase(thunks.add.fulfilled, (state, action) => {
        state.addStatus = 'idle'
        state.addId = action.payload
      })
      .addCase(thunks.add.rejected, (state, action) => {
        state.addStatus = 'failed'
        state.addError = action.error.message
      })
  },
})

export const selector = (state: RootState) => state.snapshots
export const { reset } = slice.actions
export default slice.reducer
