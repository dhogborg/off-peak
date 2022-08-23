import React, { useEffect } from 'react'
import { Redirect } from 'react-router'

import { useSelector } from 'react-redux'
import { useAppDispatch } from '../lib/hooks'

import * as auth from '../lib/auth/reducer'
import Alert from '../app/components/Alert'

type Props = { location: Location }

export default function Callback(props: Props) {
  const authState = useSelector(auth.selector)
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(auth.setToken({ uri: window.location.href }))
  }, [])

  if (authState.error) {
    return <Alert type="oh-no">{authState.error}</Alert>
  }

  if (!authState.token) {
    return <Alert>Laddar...</Alert>
  } else {
    return <Redirect to="/homes" />
  }
}
