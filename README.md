> **Warning**
> This is not a standalone module; it is designed to be expanded upon and run independently.

# NWWS-OI Parser

The NWWS-OI Parser is a Node.js module that offers an interface for receiving National Weather Service (NWS) warnings and products via the XMPP (Jabber) protocol. It enables real-time reception of NWS warnings and products by connecting to the NWS XMPP server.

## Potential Use Cases

NWWS-OI Parser can be utilized in various applications, including but not limited to:

1. Alert dashboards
2. Bots for distributing alerts to users within an application
3. Text message alerting for weather warnings
4. Integration into the Emergency Alert System (EAS)
5. Implementation in emergency management applications
6. And much more.

### Why Use This?

#### Type Safety and Speed

- **Type Safety:** NWWS-OI Parser is designed with type safety in mind, ensuring that you receive structured and well-typed data, reducing the likelihood of runtime errors in your application.

- **Faster Data:** When compared to using public NWS APIs, NWWS-OI Parser offers a faster way to access NWS warnings and products. By connecting directly to the source, you receive real-time data with minimal delays.

### Prerequisites

Before using NWWS-OI Parser, you'll need to have an account with the National Weather Service. If you don't have an account yet, you can register for one [here](https://www.weather.gov/NWWS/nwws_oi_request).

### Getting Started

Follow these steps to get started with NWWS-OI Parser:

1. Install the required dependencies by running:
   ```
   npm install
   ```

2. Create a `.env` file and fill it in based on the provided `.env.example` file. Note that a Discord webhook is not required and is primarily for testing purposes.

3. To start the parser, run:
   ```
   npm run start
   ```

4. To build the project, use:
   ```
   npm run build
   ```

5. For hot-reloading during development, use:
   ```
   npm run dev
   ```

6. To run tests, execute:
   ```
   npm run test
   ```

Alternatively, if you want to run the parser once, you can use:
   ```
   npm run uhh
   ```

### Questions and Concerns

If you have any questions or intend to use this parser in a production application, please don't hesitate to contact the developer at matthew@mwalden.tech.