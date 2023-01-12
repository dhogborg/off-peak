import ReactDOM from 'react-dom'

import { Provider } from 'react-redux'
import { store, history } from './lib/store'

import * as Sentry from '@sentry/react'
import { BrowserTracing } from '@sentry/tracing'

import './index.css'

import App from './App'
import { ConnectedRouter } from 'connected-react-router'

Sentry.init({
  dsn: 'https://200ae0bf60bb4072839f935c5afc1920@o198594.ingest.sentry.io/4504493028605952',
  integrations: [new BrowserTracing()],
  // 0 to 1, higher sampling is more resource intensive
  tracesSampleRate: 1.0,
})

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <App />
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root')
)
