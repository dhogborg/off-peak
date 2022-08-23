import { createSlice, SerializedError } from '@reduxjs/toolkit'
import { RootState } from '../store'

import * as Types from './types'

import * as thunks from './thunks'

export interface State {
  homes: {
    status: 'idle' | 'loading' | 'failed'
    error?: string
    items: Types.Home[]
    map: { [key: string]: Types.Home }
  }
  consumption: {
    status: 'idle' | 'loading' | 'failed'
    error?: string
    nodes: Types.ConsumptionNode[]
  }
  price: {
    status: 'idle' | 'loading' | 'failed'
    error?: string
    nodes: Types.PriceNode[]
  }
}

const initialState: State = {
  homes: {
    status: 'idle',
    items: [],
    map: {},
  },
  consumption: {
    status: 'idle',
    nodes: [],
  },
  price: {
    status: 'idle',
    nodes: [],
  },
}

export const slice = createSlice({
  name: 'tibber',
  initialState,

  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(thunks.getHomes.pending, (state) => {
        state.homes.status = 'loading'
        state.homes.error = undefined
      })
      .addCase(thunks.getHomes.fulfilled, (state, action) => {
        state.homes.status = 'idle'
        state.homes.items = action.payload

        action.payload.forEach((home) => {
          state.homes.map[home.id] = home
        })
      })
      .addCase(thunks.getHomes.rejected, (state, action) => {
        state.homes.status = 'failed'
        state.homes.error = action.error.message
      })

      .addCase(thunks.getConsumption.pending, (state) => {
        state.consumption.status = 'loading'
        state.consumption.error = undefined
      })
      .addCase(thunks.getConsumption.fulfilled, (state, action) => {
        state.consumption.status = 'idle'
        state.consumption.nodes = action.payload
      })
      .addCase(thunks.getConsumption.rejected, (state, action) => {
        state.consumption.status = 'failed'
        state.consumption.error = action.error.message
      })

      .addCase(thunks.getPrice.pending, (state) => {
        state.price.status = 'loading'
        state.price.error = undefined
      })
      .addCase(thunks.getPrice.fulfilled, (state, action) => {
        state.price.status = 'idle'
        state.price.nodes = action.payload
      })
      .addCase(thunks.getPrice.rejected, (state, action) => {
        state.price.status = 'failed'
        state.price.error = action.error.message
      })
  },
})

export const selector = (state: RootState) => state.tibber

export default slice.reducer
