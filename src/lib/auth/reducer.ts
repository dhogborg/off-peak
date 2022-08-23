import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { handledFetch } from '../http'
import { RootState } from '../store'

import * as auth from './auth'

export interface State {
  isLoggedIn: boolean
  token?: string

  status: 'idle' | 'loading' | 'failed'
  error?: string
}

const initialState: State = {
  isLoggedIn: auth.isLoggedIn(),
  token: auth.getToken(),

  status: 'idle',
}

export const setToken = createAsyncThunk<void, { uri: string }>('auth/setToken', async (arg) => {
  await auth.setToken(arg.uri)
})

export const slice = createSlice({
  name: 'auth',
  initialState,

  reducers: {
    login: (state) => {
      auth.login()
    },
    logout: (state) => {
      auth.logout()
      state.isLoggedIn = false
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(setToken.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(setToken.fulfilled, (state, action) => {
        state.status = 'idle'
        state.token = auth.getToken()
        state.isLoggedIn = true
      })
      .addCase(setToken.rejected, (state, action) => {
        state.status = 'failed'
        state.isLoggedIn = false
        state.error = action.error.message
      })
  },
})

export const selector = (state: RootState) => state.auth

export const { login, logout } = slice.actions
export default slice.reducer
