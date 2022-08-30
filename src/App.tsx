import { Switch, Route } from 'react-router-dom'

import Cover from './app/Cover'
import Menu from './app/components/Menu'
import About from './app/About'
import Homes from './app/Homes'
import List from './app/List'
import Callback from './app/Callback'
import GraphLoader from './app/Graph/GraphLoader'
import SnapLoader from './app/Graph/SnapLoader'

import './App.css'
import { useDispatch } from 'src/lib/hooks'
import { setBetaMode } from './lib/config'

export default function App() {
  const dispatch = useDispatch()
  if (window.location.hash === '#beta') {
    dispatch(setBetaMode(true))
  }

  return (
    <Switch>
      <>
        <div className="App">
          <Menu />
          <Route path="/" exact component={Cover} />
          <Route path="/about" exact component={About} />
          <Route path="/homes" exact component={Homes} />
          <Route path="/homes/:priceAreaCode/:gridAreaCode/:id/graphs" component={GraphLoader} />
          <Route path="/list" exact component={List} />
          <Route path="/snaps/:id/graphs" component={SnapLoader} />
          <Route path="/auth/callback" exact component={Callback} />
        </div>
      </>
    </Switch>
  )
}
