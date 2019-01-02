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
          Eftersom el måste användas direkt när den produceras så är den billigare när den inte
          behövs. Att köpa el off-peak blir därför ett lätt sätt att köpa billig(are) el. Om ditt
          hushåll konsumerar mindre än snitt-hushållet under dagen och mer under natten - då har du
          en god chans att spara pengar genom att anävnda tim-debitering. Om ditt hushåll konsumerar
          precis som ett snitt-hushåll, då betalar du exakt samma som med dagligt spot-pris.
        </p>
        <p>
          Detta verktyg läser din konsumptions-data timme-för-timme, så att det kan jämföras med ett
          snitthushåll.
        </p>
        <p>
          Appen är möjlig tack vare det trevliga APIet (och människorna) på{' '}
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
                return <Link to={'/homes'}>Clicka här för att visa din data</Link>
              } else {
                return (
                  <a href="#" onClick={auth.login}>
                    Klicka här för att logga in med ditt Tibber-konto.
                  </a>
                )
              }
            }}
          </Unstated.Subscribe>
        </p>
        <p>
          Appen är open source och tillgänglig på{' '}
          <a href="https://github.com/dhogborg/off-peak" target="_blank">
            github.com
          </a>
          . <br />
          Pull requests välkomna 🤗.
        </p>
      </div>
    </Screen>
  )
}

export default About
