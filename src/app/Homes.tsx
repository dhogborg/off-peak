import React, { ReactNode, useEffect } from 'react'
import { Redirect } from 'react-router'

import * as tibber from '../lib/tibber'
import Alert from '../app/components/Alert'

import './Homes.css'

import { useDispatch, useSelector } from 'src/lib/hooks'

import { push } from 'connected-react-router'

export default function Homes() {
  const dispatch = useDispatch()
  const tibberState = useSelector(tibber.selector)

  useEffect(() => {
    if (tibberState.homes.items === undefined) {
      dispatch(tibber.getHomes())
    }
  }, [dispatch, tibberState.homes.items])

  const clickedHome = (home: tibber.Home) => {
    const { priceAreaCode, gridAreaCode } = home.meteringPointData
    dispatch(push(`/homes/${priceAreaCode}/${gridAreaCode}/${home.id}/graphs`))
  }

  if (tibberState.homes.error) {
    return <Alert type="oh-no">{tibberState.homes.error}</Alert>
  }

  if (tibberState.homes.status === 'loading' || tibberState.homes.items === undefined) {
    return <Alert>Laddar...</Alert>
  }

  switch (tibberState.homes.items?.length) {
    case 0:
      return <Alert>Det finns inga hem kopplade till ditt konto</Alert>

    case 1: {
      const home = tibberState.homes.items[0]
      const { priceAreaCode, gridAreaCode } = home.meteringPointData
      return <Redirect to={`/homes/${priceAreaCode}/${gridAreaCode}/${home.id}/graphs`} />
    }

    default:
      return (
        <div className="homes">
          {tibberState.homes.items.map((home) => {
            return <Home key={home.id} home={home} onClick={clickedHome} />
          })}
        </div>
      )
  }
}

type HomeProps = {
  key: string
  home: tibber.Home
  onClick: (home: tibber.Home) => void
  children?: ReactNode
}

const Home = (props: HomeProps) => {
  return (
    <div
      className="home"
      onClick={() => {
        props.onClick(props.home)
      }}>
      <div className="address">
        <div className="address1">{props.home.address.address1}</div>
        <div className="address2">
          {props.home.address.postalCode} {props.home.address.city}
        </div>
      </div>
      {props.children}
    </div>
  )
}
