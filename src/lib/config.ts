import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from './store'

export type PeriodTypes = 'last-month' | 'this-month' | 'rolling'
export interface State {
  periodType: PeriodTypes
  beta: boolean
}

const getInitialState = (): State => {
  let periodType: PeriodTypes = 'rolling'

  try {
    const savedPeriod = localStorage.getItem('period')

    switch (savedPeriod) {
      case 'last-month':
      case 'this-month':
      case 'rolling':
        periodType = savedPeriod
        break
      default:
    }
  } catch (err) {
    console.error('Unable to get period in localStorage', err)
  }

  // The first of month this-month is nonsensical since we don't have any data yet
  if (new Date().getDate() === 1) {
    periodType = 'rolling'
  }

  return {
    periodType,
    beta: false,
  }
}

export const slice = createSlice({
  name: 'config',
  initialState: getInitialState(),

  reducers: {
    setBetaMode: (state, action: PayloadAction<boolean>) => {
      if (action.payload) {
        console.log(`We're in beta mode baby!`)
      }
      state.beta = action.payload
    },
  },

  extraReducers: (builder) => {
    builder.addCase(setPeriod, (state, action) => {
      state.periodType = action.payload
    })
  },
})

export const setPeriod = createAction('setPeriod', (p: PeriodTypes) => {
  try {
    localStorage.setItem('period', p)
  } catch (err) {
    console.error('Unable to save period in localStorage', err)
  }
  return {
    payload: p,
  }
})

export const selector = (state: RootState) => state.config

export default slice.reducer
export const { setBetaMode } = slice.actions
