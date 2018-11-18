import React, { Component } from 'react'
import classnames from 'classnames'

import * as tibber from '../lib/tibber'

import './InfoBox.css'

type Props = {
  consumption: tibber.ConsumptionNode[]
  price: tibber.PriceNode[]
  currency: string
}

type State = {}

export default class InfoBox extends Component<Props, State> {
  readonly state: State = {}

  constructor(readonly props: Props) {
    super(props)
  }

  // Total consumption
  consumption(): number {
    let consumption = 0
    for (let i = this.props.consumption.length - 1; i >= 0; i--) {
      consumption += this.props.consumption[i].consumption
    }
    return consumption
  }

  // The cost when charged hourly rate
  totalCost(): number {
    let cost = 0
    for (let i = this.props.consumption.length - 1; i >= 0; i--) {
      cost += this.props.consumption[i].unitCost
    }
    return cost
  }

  // The cost as it would have been if charged by daily average
  potentialCost(): number {
    let cost = 0
    for (let i = this.props.consumption.length - 1; i >= 0; i--) {
      cost += this.props.consumption[i].consumption * this.props.price[i].total
    }
    return cost
  }

  render() {
    // Bail early before we get our data
    if (!this.props.consumption || !this.props.price || this.props.price.length == 0) {
      return (
        <div className="info-box loading">
          <h2>Loading...</h2>
        </div>
      )
    }

    if (this.props.consumption.length > this.props.price.length) {
      return <div className="info-error">The price and consumption data can't be matched</div>
    }

    // Total consumption
    const consumption = this.consumption()
    // The cost when charged hourly rate
    const costHourRate = this.totalCost()
    // The cost as it would have been if charged by daily average
    const costDayAvrgRate = this.potentialCost()

    const hourLabelCl = classnames('currency', {
      nice: costHourRate < costDayAvrgRate,
      ouch: costHourRate > costDayAvrgRate,
    })

    const dayAvrgLabelCl = classnames('currency', {
      nice: costHourRate > costDayAvrgRate,
      ouch: costHourRate < costDayAvrgRate,
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
              {costHourRate.toFixed(0)} {this.props.currency}
            </label>
          </dd>
          <dt>Cost on average rate **</dt>
          <dd>
            <label className={dayAvrgLabelCl}>
              {costDayAvrgRate.toFixed(0)} {this.props.currency}
            </label>
          </dd>
        </dl>
        <div className="how-did-i-do">
          {costHourRate < costDayAvrgRate ? (
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
          * Last 30 days
          <br />
          ** In theory, including VAT and taxes
        </span>
      </div>
    )
  }
}
