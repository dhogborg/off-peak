import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from './store'

export type PeriodTypes = 'last-month' | 'this-month' | 'rolling'
export interface State {
  periodType: PeriodTypes
  beta: boolean
}


let periodType = 'rolling' as PeriodTypes;

try {
  const savedPeriod = localStorage.getItem('period');
  
  if(savedPeriod === 'last-month' || savedPeriod === 'this-month' || savedPeriod === 'rolling') {
    periodType = savedPeriod;
  } else {
    periodType = 'rolling';
  }
} catch(err) {
  console.error('Unable to get period in localStorage', err);
}

const initialState: State = {
  periodType,
  beta: false,
}

export const slice = createSlice({
  name: 'config',
  initialState,

  reducers: {
    hydrate: (state, action) => {
      // state.periodType = 'rolling'
      return action.payload
    },
    setPeriod: (state, action: PayloadAction<PeriodTypes>) => {
      state.periodType = action.payload;

      try {
        localStorage.setItem('period', action.payload)
      } catch(err) {
        console.error('Unable to save period in localStorage', err);
      }
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
