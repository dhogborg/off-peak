import React, { Component } from 'react'
import * as Unstated from 'unstated'

import * as tibber from '../lib/tibber'
import * as svk from '../lib/svk'
import * as dataprep from '../lib/dataprep'

import InfoBox from '../components/InfoBox'
import ConsumptionChart from '../components/ConsmptionChart'
import HistogramChart from '../components/Histogram'
import Screen from '../components/Screen'
import { AuthContainer } from '../App'
import { Redirect } from 'react-router'

// import { priceNodes as price, consumptionNodes as consumption } from '../mock/tibber'
// import { profile as profileCsv } from '../mock/svk'

type State = {
  days?: dataprep.Day[]
  consumption?: tibber.ConsumptionNode[]
  price?: tibber.PriceNode[]
  profile?: svk.ProfileNode[]
  error?: Error
}

class App extends Component<object, State> {
  readonly state: State = {}

  async componentDidMount() {
    const period = 32 * 24

    try {
      let consumption = await tibber.getConsumption(tibber.Interval.Hourly, period)
      // price is sometimes ahead by 24 hours, so we always add another period on it
      let price = await tibber.getPrice(tibber.Interval.Hourly, period + 24)

      let profileCsv = await svk.getProfile(period)
      let profile = svk.parseCSV(profileCsv)

      const days = dataprep.aggregateDays(consumption, price, profile)

      this.setState({
        ...this.state,
        days,
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
    if (this.state.error) {
      return (
        <Screen height="100vh">
          <h1>Error</h1>
          <p>{this.state.error.message}</p>
        </Screen>
      )
    }

    if (!this.state.consumption || !this.state.profile || !this.state.days) {
      return (
        <Screen height="100vh">
          <h1>Loading...</h1>
        </Screen>
      )
    }

    return (
      <div className="main">
        <Screen>
          <InfoBox days={this.state.days} currency="SEK" />
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
          <ConsumptionChart days={this.state.days} />
        </Screen>
        <Screen height="20vh">
          <h3>How to read that graph</h3>
          <p>
            The difference between the lines is the difference in rate (SEK per kWh) paid by you,
            and the rate paid by the average household with a zero-overhead tariff (ie. the utility
            adds 0 SEK on top of the spot price). The bars represent your consumption on that
            particular day, use it to draw conclusions as to why the price differs (or not). For
            instance, a day when you weren't home, there might not be a big difference, your
            consumption would be linear over the day. A day when you charged your car during the
            night, the difference is higher, and a day when you forgot to turn off the oven between
            5 and 7 PM, you might see the price paid go above the average.
          </p>
        </Screen>
        <Screen height="20vh">
          <h3>Histogram</h3>
          <p>
            The chart shows you when you consume energy during a day, on average.
            <br />
            Overlaid (blue line) represents the average household.
          </p>
        </Screen>
        <Screen>
          <HistogramChart consumption={this.state.consumption} profile={this.state.profile} />
        </Screen>
        <Screen height="20vh">
          <h3>How to read that graph</h3>
          <p>
            Since energy is cheaper when no one else is wants it, using energy off-peak is a way to
            buy cheap(er) energy. The blue line is the average household's consumption pattern, and
            it's generally higher during the daytime, highest around the evening. The bars
            represents your consumption pattern. Whenever your bars are below the line, you consume
            less, and vise-versa. If you consume less than average during daytime, and more than
            average during night time, you have a reasonable chance to save money by going with hour
            based metering.
          </p>
        </Screen>
      </div>
    )
  }
}

export default App
