import {
  TypedUseSelectorHook,
  // eslint-disable-next-line no-restricted-imports
  useDispatch as useReactDispatch,
  // eslint-disable-next-line no-restricted-imports
  useSelector as useReactSelector,
} from 'react-redux'
import { RootState, AppDispatch } from './store'

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useDispatch = () => useReactDispatch<AppDispatch>()
export const useSelector: TypedUseSelectorHook<RootState> = useReactSelector
