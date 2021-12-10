import React from 'react'
import classnames from 'classnames'

import * as dataprep from '../../lib/dataprep'

import './DataBoxes.css'

type Props = {
  days: dataprep.Day[]
}

const dayIsComplete = (day: dataprep.Day) => {
  return !!(day.potentialCost && day.totalCost && day.consumption)
}

const DataBoxes = function(props: Props) {
  // The cost when charged hourly rate
  const completeDays = props.days.filter(dayIsComplete)

  const totalCost = completeDays.map((day) => day.totalCost).reduce((p, v) => p + v, 0)
  // The cost as it would have been if charged by daily average
  const potentialCost = completeDays.map((day) => day.potentialCost).reduce((p, v) => p + v, 0)
  // Total consumption
  const consumption = completeDays.map((day) => day.consumption).reduce((p, v) => p + v, 0)

  return (
    <div className="info-box">
      <div className="col">
        <Consumed consumption={consumption} totalCost={totalCost} dayCount={completeDays.length} />
      </div>
      <div className="col">
        <CostInfo totalCost={totalCost} potentialCost={potentialCost} />
      </div>
      {!isNaN(potentialCost) ? (
        <div className="how-did-i-do">
          {totalCost < potentialCost ? (
            <span>Du sparar pengar genom att använda off-peak el, nice.</span>
          ) : (
            <span>
              Du betalade mer de senaste {props.days.length} dagarna jämfört med vad du hade gjort
              med ett kontrakt med dagsavläst räkning. Detta kan bero på att du använt prylar som
              drar mycket el under dyra timmar, eller att du inte använt mycket el under dygnets
              billiga timmar. Se histogrammet längre ner.
            </span>
          )}
        </div>
      ) : null}
      <div className="fine-print">
        * Spotpriset per timme gånger din konsumption viktat per timme för snitthusållet i ditt
        område. Dvs vad du hade betalt utan timavräkning.
      </div>
      <div className="fine-print">Alla kostnader ink moms</div>
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
        <dt>Kostnad med timavräkning</dt>
        <dd>
          <label className="currency hour-cost">
            {props.totalCost.toFixed(1)} {currency}
          </label>
        </dd>
        <dt>Kostnad med viktat spotpris*</dt>

        <dd>
          <label className="currency spot-cost">
            {!isNaN(props.potentialCost)
              ? props.potentialCost.toFixed(1) + ' ' + currency
              : 'Väntar på data'}
          </label>
        </dd>
        <dt>Sparat</dt>
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
        <dt>Konsumption under {props.dayCount} dagar</dt>
        <dd>
          <label className="consumption">{props.consumption.toFixed(1)} kWh</label>
        </dd>
        <dt>Snittpris per kWh</dt>
        <dd>
          <label className="consumption">{(avrgPrice * 100).toFixed(1)} öre</label>
        </dd>
      </dl>
    </div>
  )
}
