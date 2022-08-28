import React, { useEffect } from 'react'
import { Redirect } from 'react-router'

import { useSelector } from 'src/lib/hooks'
import { useDispatch } from '../lib/hooks'

import * as auth from '../lib/auth/reducer'
import Alert from '../app/components/Alert'

type Props = { location: Location }

export default function Callback(props: Props) {
  const authState = useSelector(auth.selector)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(auth.setToken({ uri: window.location.href }))
  }, [dispatch])

  if (authState.error) {
    return <Alert type="oh-no">{authState.error}</Alert>
  }

  if (!authState.token) {
    return <Alert>Laddar...</Alert>
  } else {
    return <Redirect to="/homes" />
  }
}
