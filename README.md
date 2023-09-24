> **Warning**
> This is not a module, it is built to be expanded on and ran independently.

# NWWS-OI Injestor

NWWS-OI is a Node.js module that provides an interface for receiving National Weather Service (NWS) warnings and products via XMPP (Jabber) protocol. It allows you to receive NWS warnings and products in real-time by connecting to the NWS XMPP server.

# Potential Use Cases
1. Alert dashboards
2. Bots to dissemenate alerts to users of an app.etc
3. Text message alerting for warnings
4. Use in EAS
5. Implentation into emergency management applications
6. And even more.

### Prerequisites

To use NWWS-OI, you need to have an account with the National Weather Service. If you don't have an account yet, you can register [here](https://www.weather.gov/NWWS/nwws_oi_request).

### Usage

First of all, install the required dependecies, and have a MongoDB server (you can optionally pretty easily strip the code for this).
> npm i

Create a .env file, and fill it in like the .env.example file. Discord webhook is not required, it is just for testing.

To run
> npm run start

To build
> npm run build

To have hot-reload
> npm run dev

To run the test
> npm run test

Or if you only want to run once

> npm run uhh

### Questions, concerns

If you have any questions, or wish to use this in a production application please contact me at matthew@mwalden.tech.