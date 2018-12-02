import React, { Component } from 'react'
import { match } from 'react-router'

import * as tibber from '../lib/tibber'
import * as svk from '../lib/svk'
import * as dataprep from '../lib/dataprep'

import Alert from '../components/Alert'
import InfoBox from '../components/InfoBox'
import ConsumptionChart from '../components/ConsmptionChart'
import HistogramChart from '../components/Histogram'
import Screen from '../components/Screen'

// import { priceNodes as price, consumptionNodes as consumption } from '../mock/tibber'
// import { profile as profileCsv } from '../mock/svk'

type Params = {
  id: string
  sn: string
}

type Props = {
  match: match<Params>
}

type State = {
  days?: dataprep.Day[]
  consumption?: tibber.ConsumptionNode[]
  price?: tibber.PriceNode[]
  profile?: svk.ProfileNode[]
  error?: Error
}

class Main extends Component<Props, State> {
  readonly state: State = {}

  async componentDidMount() {
    const homeId = this.props.match.params.id
    const area = this.props.match.params.sn as svk.Area

    const period = 32 * 24
    try {
      let consumption = await tibber.getConsumption(homeId, tibber.Interval.Hourly, period)
      // price is sometimes ahead by 24 hours, so we always add another period on it
      let price = await tibber.getPrice(homeId, tibber.Interval.Hourly, period + 24)

      let profileCsv = await svk.getProfile(area, period)
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
      return <Alert type="oh-no">{this.state.error.message}</Alert>
    }

    if (!this.state.consumption || !this.state.profile || !this.state.days) {
      return <Alert>Loading...</Alert>
    }

    if (this.state.days.length == 0) {
      return <Alert type="oh-no">Data retreival error</Alert>
    }

    return (
      <div className="main">
        <Screen>
          <InfoBox days={this.state.days} currency="SEK" />
        </Screen>
        <Screen height="20vh">
          <h3>Hourly metering vs. Daily metering</h3>
          <p>
            If you meter by hour you pay the spot price that hour, times your consumption that hour.
          </p>
          <p>
            If your consumption is metered by day, you still pay the hourly spot price, but your
            consumption that hour is derived from the consumption of all the households in your
            area.
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
            particular day, use it to draw conclusions as to why the price differs (or not).
          </p>
          <p>
            For instance, a day when you weren't home, there might not be a big difference, your
            consumption would be linear over the day. A day when you charged your car during the
            night, the difference is higher, and a day when you forgot to turn off the oven between
            5 and 7 PM, you might see the price paid go above the average.
          </p>
        </Screen>
        <Screen height="20vh">
          <h3>Histogram</h3>
          <p>
            The chart shows you <b>when</b> you consume energy during a day, on average.
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

export default Main
