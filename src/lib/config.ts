import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from './store'

export type PeriodTypes = 'monthly' | 'continuous'
export interface State {
  periodType: PeriodTypes
}

const initialState: State = {
  periodType: 'continuous',
}

export const slice = createSlice({
  name: 'tibber',
  initialState,

  reducers: {
    setPeriod: (state, action: PayloadAction<PeriodTypes>) => {
      state.periodType = action.payload
    },
  },
})

export const selector = (state: RootState) => state.config

export default slice.reducer
export const { setPeriod } = slice.actions
