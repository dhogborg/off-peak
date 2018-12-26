import React from 'react'
import * as Unstated from 'unstated'

import Screen from '../app/components/Screen'
import { AuthContainer } from '../App'
import { Link } from 'react-router-dom'

import './About.css'

const About = () => {
  return (
    <Screen className="about">
      <div className="welcome">
        <p>
          Since energy is cheaper when no one else is wants it, using energy off-peak is a way to
          buy cheap(er) energy. If you consume less than the average household during daytime, and
          more than average during night time, you have a reasonable chance to save money by going
          with hour based metering. If you consume exactly like the average, you pay exactly the
          same.
        </p>
        <p>
          This tool reads your consumption data on an hour-by-hour interval so it can be compared to
          the average household. It can't tell you if you are going to save money in the future, but
          it can tell you how much you did save during the last 30 days.
        </p>
        <p>
          This tool is possible thanks to the wonderful API (and people) at
          <a href="https://sverige.tibber.com" target="_blank">
            Tibber.
          </a>
          <br />
          Not affiliated in any way.
        </p>
        <p>
          <Unstated.Subscribe to={[AuthContainer]}>
            {(auth: AuthContainer) => {
              if (auth.state.isLoggedIn) {
                return <Link to={'/homes'}>Click here to view your data</Link>
              } else {
                return (
                  <a href="#" onClick={auth.login}>
                    Click here to log in with your Tibber account
                  </a>
                )
              }
            }}
          </Unstated.Subscribe>
        </p>
        <p>
          The tool is open source and available at
          <a href="https://github.com/dhogborg/off-peak" target="_blank">
            github.com
          </a>
          . <br />
          Pull requests welcome 🤗.
        </p>
      </div>
    </Screen>
  )
}

export default About
