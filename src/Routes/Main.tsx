import React, { Component } from 'react'

import * as tibber from '../lib/tibber'
import * as svk from '../lib/svk'

import InfoBox from '../components/InfoBox'
import ConsumptionChart from '../components/ConsmptionChart'
import HistogramChart from '../components/Histogram'
import { Screen } from '../components/Screen'

// import { priceNodes as price, consumptionNodes as consumption } from '../mock/tibber'
// import { profile as profileCsv } from '../mock/svk'

type State = {
  consumption: tibber.ConsumptionNode[]
  price: tibber.PriceNode[]
  profile: svk.ProfileNode[]
  error?: Error
}

class App extends Component<object, State> {
  readonly state: State = {
    consumption: [],
    price: [],
    profile: [],
  }

  async componentDidMount() {
    const period = 32 * 24

    try {
      let consumption = await tibber.getConsumption(tibber.Interval.Hourly, period)
      // price is sometimes ahead by 24 hours, so we always add another period on it
      let price = await tibber.getPrice(tibber.Interval.Hourly, period + 24)

      let profileCsv = await svk.getProfile(period)
      let profile = svk.parseCSV(profileCsv)

      this.setState({
        ...this.state,
        consumption,
        price,
        profile,
      })
    } catch (err) {
      this.setState({
        ...this.state,
        error: new Error('Unable to load data: ' + err),
      })
    }
  }

  render() {
    console.log(this.state)
    if (this.state.error) {
      return (
        <Screen height="100vh">
          <h1>Error</h1>
          <p>{this.state.error.message}</p>
        </Screen>
      )
    }

    return (
      <div className="main">
        <Screen>
          <InfoBox
            consumption={this.state.consumption}
            price={this.state.price}
            profile={this.state.profile}
            currency="SEK"
          />
        </Screen>
        <Screen height="20vh">
          <h3>Hourly rate vs. average rate</h3>
          <p>If you meter by hour you pay the price that hour times your consumption.</p>
          <p>
            If you don't meter per hour, you still pay the hourly price, but your price is derived
            from the consumption of all the households in your area.
          </p>
        </Screen>
        <Screen>
          <ConsumptionChart
            consumption={this.state.consumption}
            price={this.state.price}
            profile={this.state.profile}
          />
        </Screen>
        <Screen height="20vh">
          <h3>Histogram</h3>
          <p>The chart shows you when you consume energy during a day, on average.</p>
        </Screen>
        <Screen>
          <HistogramChart consumption={this.state.consumption} profile={this.state.profile} />
        </Screen>
      </div>
    )
  }
}

export default App
