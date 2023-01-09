import ReactDOM from 'react-dom'

import { Provider } from 'react-redux'
import { store, history } from './lib/store'

import './index.css'

import App from './App'
import { ConnectedRouter } from 'connected-react-router'

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <App />
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root')
)
