import React, { Component } from 'react'

import * as tibber from '../../lib/tibber'
import * as svk from '../../lib/svk'
import * as dataprep from '../../lib/dataprep'

import Screen from '../components/Screen'
import DataBoxes from './DataBoxes'
import ConsumptionChart from './Charts/Consmption'
import HistogramChart from './Charts/Histogram'

type Props = {
  days: dataprep.Day[]
  consumption: tibber.ConsumptionNode[]
  profile: svk.ProfileNode[]
}

const Graphs = (props: Props) => {
  return (
    <div className="main">
      <Screen>
        <DataBoxes days={props.days} />
      </Screen>
      <Screen height="20vh">
        <h3>Hourly metering vs. Daily metering</h3>
        <p>
          If you meter by hour you pay the spot price that hour, times your consumption that hour.
        </p>
        <p>
          If your consumption is metered by day, you still pay the hourly spot price, but your
          consumption that hour is derived from the consumption of all the households in your area
          (see blue line in histogram further down below).
        </p>
      </Screen>
      <Screen>
        <ConsumptionChart days={props.days} />
      </Screen>
      <Screen height="20vh">
        <h3>How to read that graph</h3>
        <p>
          THe lines show the difference in rate (SEK per kWh) paid by you, and the rate paid by an
          average household with a zero overhead tariff (ie. the utility adds 0 SEK on top of the
          spot price). The bars represent your consumption on a particular day, use it to draw
          conclusions as to why the price differs (or not).
        </p>
        <p>
          The size of the blue area is the difference between highest and lowest spot price. The
          bigger the difference, the more you stand to gain from using off-peak energy.
        </p>
        <p>
          For instance, a day when you weren't home, there might not be a big difference, your
          consumption would be linear over the day. A day when you charged your car during the
          night, the difference is higher, and a day when you forgot to turn off the oven between 5
          and 7 PM, you might see the price paid go above the average.
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
        <HistogramChart consumption={props.consumption} profile={props.profile} />
      </Screen>
      <Screen height="20vh">
        <h3>How to read that graph</h3>
        <p>
          The bars represents your consumption pattern. The blue line is the average household's
          consumption pattern, and it's generally higher during the daytime, highest around the
          evening. Whenever your bars are below the line, you consume less than the average, and
          vise-versa. If you consume less than average during daytime, and more than average during
          night time, you have a reasonable chance to save money by going with hour based metering.
        </p>
      </Screen>
    </div>
  )
}

export default Graphs
