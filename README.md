## Off-peak

This tool reads your consumption data on an hour-by-hour interval and calculates how your household performs against the average, and how much you saved by using hour metering.

This tool is possible thanks to the wonderful API (and people) at [Tibber](https://sverige.tibber.com/).

The project can be viewed and used on https://offpeak.se

### Configuring credentials

#### Server

In `server/`, copy `client.example.env` to `client.env`, fill in the application credentials from Tibber in the new file.
This is only possible (and necessary) for developers with full production access and to test the authentication.

If building a docker image and testing the production build, use `docker.env` in the project root. _This is not recommended_.

#### Running without credentials

- Start development server, both backend and frontend, see below.
- Login at https://offpeak.se
- Locate and copy the value of localStorage keys: `access_token`, `expires`
- Create those localStorage keys on the development server running at http://localhost:3000 and enter the values from the production site.

Using this method you can develop most aspects of the site, except the login flow. To use the snapshot functionality you can create your own firebase project and use those credentials.

### Setup

- Run `yarn install` in project root

### Running

Run `make run` in the `server/` folder, this starts the backend.
Run `make run` in project root, this starts the frontend dev server.
