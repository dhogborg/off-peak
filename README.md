## Off-peak

This tool reads your consumption data on an hour-by-hour interval and calculates how your household performs against the average, and how much you saved by using hour metering.

This tool is possible thanks to the wonderful API (and people) at [Tibber](https://sverige.tibber.com/). 

### Credentials

See `src/oauth2.example.ts`, fill in the application credentials from Tibber.

### Setup

* Run `nvm use` to set the Node.js version
* Run `yarn install` in project root

### Running
Run `make run` in the `server/` folder, this starts a CORS proxy.
Run `make run` in project root, this starts the dev server.
