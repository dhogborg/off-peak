import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit'

import { History, createBrowserHistory } from 'history'
import { routerMiddleware, connectRouter } from 'connected-react-router'
import { applyMiddleware, compose, combineReducers } from 'redux'

import auth from './auth/reducer'
import config from './config'
import tibber from './tibber/reducer'
import svk from './svk/reducer'
import snapshots from './snapshots/reducer'

export const history = createBrowserHistory()

const createRootReducer = (history: History) =>
  combineReducers({
    auth,
    tibber,
    snapshots,
    svk,
    config,

    router: connectRouter(history),
  })

export const store = configureStore({
  reducer: createRootReducer(history),
  preloadedState: {},
  enhancers: [
    compose(
      applyMiddleware(
        routerMiddleware(history) // for dispatching history actions
        // ... other middlewares ...
      )
    ),
  ],
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>
