import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from './store'

export type PeriodTypes = 'last-month' | 'this-month' | 'rolling'
export interface State {
  periodType: PeriodTypes
  beta: boolean
}

const initialState: State = {
  periodType: 'rolling',
  beta: false,
}

export const slice = createSlice({
  name: 'config',
  initialState,

  reducers: {
    setPeriod: (state, action: PayloadAction<PeriodTypes>) => {
      state.periodType = action.payload
    },
    setBetaMode: (state, action: PayloadAction<boolean>) => {
      console.log(`We're in beta mode baby!`)
      state.beta = action.payload
    },
  },
})

export const selector = (state: RootState) => state.config

export default slice.reducer
export const { setPeriod, setBetaMode } = slice.actions
