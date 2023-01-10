import React from 'react'
import * as tibber from '../../lib/tibber'
import * as svk from '../../lib/svk'
import * as dataprep from '../../lib/dataprep'

import Screen from '../components/Screen'
import DataBoxes from './DataBoxes'
import ConsumptionChart from './Charts/Consumption'
import HistogramChart from './Charts/Histogram'

export const DataSourceContext = React.createContext<'snapshot' | 'api'>('api')

type Props = {
  days: dataprep.Day[]
  consumption: tibber.ConsumptionNode[]
  price: tibber.PriceNode[]
  profile: svk.ProfileNode[]
  weightedAverage: number
}

const Graphs = (props: Props) => {
  return (
    <div className="main">
      <Screen>
        <DataBoxes days={props.days} weightedAverage={props.weightedAverage} />
      </Screen>
      <Screen height="20vh">
        <h3>Timavläsning vs. dagsavläsning</h3>
        <p>
          Om din användning mäts per timme så betalar du den timmens spotpris per kWh gånger din
          användning den timmen. Spotpris 💵 ️✖️ Användning ⚡️ = Att betala 💸.
        </p>
        <p>
          Om din användning mäts per månad så betalar du fortfarande spotpris per timme, men din
          konsumtion en viss timme räknas ut genom att lägga ihop alla hushåll i ditt område och
          betala din andel av den totala konsumtionen. (Spotpris 💵 ️✖️ Allas användning ⚡️) ✖️ Din{' '}
          <b>%</b> andel ⚡️ = Att betala 💸.
        </p>
        <p>
          Det betyder att ditt elpris beror på hur mycket el du använder, samt när ett snitthushåll
          använder el, du kan få betala mycket för dyra timmar trots att du inte använde någon el
          just då.
        </p>
      </Screen>
      <Screen>
        <ConsumptionChart days={props.days} />
      </Screen>
      <Screen height="20vh">
        <h3>Hur man läser det diagrammet</h3>
        <p>
          Linjerna visar ditt pris per kWh samt priset per kWh som du hade betalt utan timavläsning
          med ett el-avtal med 0kr påslag. De grå staplarna är din konsumtion dag-för-dag.
        </p>
        <p>
          Den ljusblå ytan är skillnaden mellan högsta och lägsta spotpris. Ju större yta, desto
          större variation i priset och desto mer kan du potentiellt spara.
        </p>
      </Screen>
      <Screen height="20vh">
        <h3>Histogram</h3>
        <p>
          Diagrammet visar <b>när</b> du konsumerar el under ett dygn, i snitt.
          <br />
          De blå linjerna visar ett snitthushåll. Den turkosa linjen visar medelpriset för den
          aktuella timmen under den valda perioden.
        </p>
      </Screen>
      <Screen>
        <HistogramChart
          consumption={props.consumption}
          price={props.price}
          profile={props.profile}
        />
      </Screen>
      <Screen height="20vh">
        <h3>Hur man läser det diagrammet</h3>
        <p>
          Staplarna visar ditt genomsnittliga konsumtionsmöster över ett dygn. Den blå linjen är ett
          snitthushålls konsumtionsmönster, och det är generellt sett högre under dagen, högst runt
          kvällen. När dina staplar är under den blå linjen konsumerar du mindre i snitt, och
          omvänt. Om du konsumerar mindre än snittet under dagtid, och mer under natten, då har du
          ett konsumtionsmöster som kommer vara väl anpassat för att spara pengar på timavräkning.
        </p>
      </Screen>
    </div>
  )
}

export default Graphs
