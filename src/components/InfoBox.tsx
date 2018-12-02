import React, { Component } from 'react'
import classnames from 'classnames'

import * as dataprep from '../lib/dataprep'

import './InfoBox.css'

type Props = {
  days: dataprep.Day[]
  currency: string
}

type State = {}

export default class InfoBox extends Component<Props, State> {
  readonly state: State = {}

  constructor(readonly props: Props) {
    super(props)
  }

  render() {
    // Total consumption
    const consumption = this.props.days.map((day) => day.consumption).reduce((p, v) => p + v)
    // The cost when charged hourly rate
    const totalCost = this.props.days.map((day) => day.totalCost).reduce((p, v) => p + v)
    // The cost as it would have been if charged by daily average
    const potentialCost = this.props.days.map((day) => day.potentialCost).reduce((p, v) => p + v)

    const hourLabelCl = classnames('currency', {
      nice: totalCost < potentialCost,
      ouch: totalCost > potentialCost,
    })

    const dayAvrgLabelCl = classnames('currency', {
      nice: totalCost > potentialCost,
      ouch: totalCost < potentialCost,
    })

    return (
      <div className="info-box">
        <dl>
          <dt>Consumed *</dt>
          <dd>
            <label className="consumption">{consumption.toFixed(0)} kWh</label>
          </dd>
          <dt>Cost on hourly rate</dt>
          <dd>
            <label className={hourLabelCl}>
              {totalCost.toFixed(0)} {this.props.currency}
            </label>
          </dd>
          <dt>Cost on average rate **</dt>
          <dd>
            <label className={dayAvrgLabelCl}>
              {potentialCost.toFixed(0)} {this.props.currency}
            </label>
          </dd>
        </dl>
        <div className="how-did-i-do">
          {totalCost < potentialCost ? (
            <span>It seems you save money by using off-peak electricity, nice.</span>
          ) : (
            <span>
              You paid more during the last 30 days than you would have if you paid the average cost
              of a kWh during the day. This can be due to using consuming appliances during peak
              hours, and not using a significant amount of energy during off-peak hours.
            </span>
          )}
        </div>
        <span className="fine-print">
          * Last {this.props.days.length} days
          <br />
          ** Based on national average, will differ sligtly depending on location
        </span>
      </div>
    )
  }
}
