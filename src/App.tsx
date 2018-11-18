import React, { Component } from 'react'

import * as tibber from './lib/tibber'

import InfoBox from './components/InfoBox'
import Chart from './components/Chart'
import { Screen } from './components/Screen'

type State = {
  consumption: tibber.ConsumptionNode[]
  price: tibber.PriceNode[]
}

class App extends Component<object, State> {
  readonly state: State = {
    consumption: [],
    price: [],
  }

  async componentDidMount() {
    let consumption = await tibber.getConsumption(tibber.Interval.Daily, 30)
    let price = await tibber.getPrice(tibber.Interval.Daily, 30)

    this.setState({
      ...this.state,
      consumption,
      price,
    })
  }

  render() {
    return (
      <div className="App">
        <header className="App-header" />
        <Screen>
          <InfoBox consumption={this.state.consumption} price={this.state.price} currency="SEK" />
        </Screen>
        <Screen>
          <Chart consumption={this.state.consumption} price={this.state.price} />
        </Screen>
      </div>
    )
  }
}

export default App
