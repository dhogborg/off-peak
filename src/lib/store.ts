import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit'

import { History, createBrowserHistory } from 'history'
import { routerMiddleware, connectRouter } from 'connected-react-router'
import { applyMiddleware, compose, combineReducers } from 'redux'

import auth from './auth/reducer'
import tibber from './tibber/reducer'

export const history = createBrowserHistory()

const createRootReducer = (history: History) =>
  combineReducers({
    auth,
    tibber,

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
