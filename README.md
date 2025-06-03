# TYR GUI

Angular 18 application

## Requirements

1. Node.js version 18 or higher
2. Last version of TyrJS downloaded locally and ready for use
3. NPM version 10 or higher

[How to install Node and NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

NPM is recommended when updating or installing new javascript packages/librararies.
New libraries or information about pre-installed can be searched fore [here](https://www.npmjs.com/)
You can read more about NPM [here](https://docs.npmjs.com/about-npm).

To view all packages and their versions installed by npm check dependencies in 'core-web/package.json'.
To update version of a package/library simply update the version nr of the package to match the desired version, then reinstall with `npm install`.

**Troubleshooting NPM**

Sometimes when updating or installing a version of a package in npm the package is not installed correctly.
To make sure the latest version is installed remove 'core-web/package-lock.json' and 'core-web/node_modules' and install all packages again with 'npm install'.

### Angular CLI

- **Angular cli** version 17.3.7

Angular cli is required to build for deployment or serve a development server.

Install with NPM: `npm install -g @angular/cli@17.3.7`

To build the application run: `ng build` in the /core-web folder

To serve a devlopment server run: `ng serve --open` in the /core-web folder

[About Angular cli](https://angular.io/cli)

## Development setup

Install all dependencies with `npm install --force` in tyr-gui/



Download and set up TyrJS locally. Find how to do so in tyr-js/docs/installation.md.

Then, execute `npm link tyr-js` under /tyr-gui to manually link the library to this project. Remember, you will have to run this command each time you install new npm packages, since npm deletes local links when running `npm install`.



Start and serve a development server with `ng serve --open`

## Update TYR_GUI managed application

Build the gui with `ng build`

Then go to /dist/tyr-demo and compress all files with `tar -czvf tyr_gui.tar.gz *`.

Then upload the file on Nexus to the correct managed application.
