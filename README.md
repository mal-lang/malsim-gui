# MAL SIM GUI

Angular 18 application for visualizing MAL simulator runs.

## Running the MAL Sim GUI

### Docker (recommended)

- Install docker on your system
- Run `docker run -p 8888:8888 mrkickling/malsim-gui:0.0.0` to run the gui locally
- Run the MAL-simulator and open http://localhost:8888 in your browser

### Angular + Python

You will need to run the FastAPI python application and the angular application separately.

#### FastAPI (backend):
1. Install Python
2. Install requirements (api/requirements.txt)
3. Run the `app:mal_app` with uvicorn

#### Angular (frontend):
1. Install Node.js version 18 or higher
2. Install NPM version 10 or higher
3. Install **Angular cli** version 17.3.7

[How to install Node and NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

To update version of a package/library simply update the version nr of the package to match the desired version, then reinstall with `npm install`.

Angular cli is required to build for deployment or serve a development server.

Install with NPM: `npm install -g @angular/cli@17.3.7`

To build the application run: `ng build` in the /malsim-gui folder

To serve a development server run: `ng serve --open` in the /malsim-gui folder

[About Angular cli](https://angular.io/cli)

## Note on API Connection

The API setup is located in src\app\services\api-service\api-service.service.ts

It is, by default, pointing at http://localhost:8888/ but feel free to change this by modifying the url in `apiUrl`

This file contains the different routes the GUI can access to, so feel free to add, delete or change any of the existing ones if needed. Remember, the GUI expects all data in the same format as in the MAL Monitor, so ensure that or modify this front end so that is able to parse the new format correctly.
