import React from 'react'
import classnames from 'classnames'

import * as dataprep from '../../lib/dataprep'

import './DataBoxes.css'

type Props = {
  days: dataprep.Day[]
}

const DataBoxes = function(props: Props) {
  // The cost when charged hourly rate
  const totalCost = props.days.map((day) => day.totalCost).reduce((p, v) => p + v)
  // The cost as it would have been if charged by daily average
  const potentialCost = props.days.map((day) => day.potentialCost).reduce((p, v) => p + v)
  // Total consumption
  const consumption = props.days.map((day) => day.consumption).reduce((p, v) => p + v)

  return (
    <div className="info-box">
      <div className="col">
        <Consumed consumption={consumption} totalCost={totalCost} dayCount={props.days.length} />
      </div>
      <div className="col">
        <CostInfo totalCost={totalCost} potentialCost={potentialCost} />
      </div>
      <div className="how-did-i-do">
        {totalCost < potentialCost ? (
          <span>You save money by using off-peak electricity, nice.</span>
        ) : (
          <span>
            You paid more during the last {props.days.length} days than you would have if you had a
            contract with daily spot-price. This can be due to using energy consuming appliances
            during peak hours, and not using a significant amount of energy during off-peak hours.
          </span>
        )}
      </div>
      <div className="fine-print">
        * The hourly spot price weighted by the average household over the course of a day. ie, what
        you pay if you don't meter per hour.
      </div>
    </div>
  )
}

export default DataBoxes

const CostInfo = function(props: { totalCost: number; potentialCost: number }) {
  const deltaCost = props.potentialCost - props.totalCost
  const deltaLabelCl = classnames('currency', {
    nice: deltaCost > 0,
    ouch: deltaCost < 0,
  })

  const currency = 'SEK'

  return (
    <div className="cost-box">
      <dl>
        <dt>Cost on hourly spot price</dt>
        <dd>
          <label className="currency hour-cost">
            {props.totalCost.toFixed(1)} {currency}
          </label>
        </dd>
        <dt>Would-be cost on daily spot price *</dt>
        <dd>
          <label className="currency spot-cost">
            {!isNaN(props.potentialCost)
              ? props.potentialCost.toFixed(1) + ' ' + currency
              : 'Waiting for data'}
          </label>
        </dd>
        <dt>Saved</dt>
        <dd>
          <label className={deltaLabelCl}>
            {!isNaN(deltaCost) ? deltaCost.toFixed(1) + ' ' + currency : '...'}
          </label>
        </dd>
      </dl>
    </div>
  )
}

const Consumed = function(props: { consumption: number; totalCost: number; dayCount: number }) {
  const avrgPrice = props.totalCost / props.consumption
  return (
    <div className="consume-box">
      <dl>
        <dt>Consumed, last {props.dayCount} days</dt>
        <dd>
          <label className="consumption">{props.consumption.toFixed(1)} kWh</label>
        </dd>
        <dt>Average price per kWh</dt>
        <dd>
          <label className="consumption">{avrgPrice.toFixed(2)} SEK</label>
        </dd>
      </dl>
    </div>
  )
}
