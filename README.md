# Stock Analysis App

The app has two parts: a frontend part written in React.js and a backend part written in express.js.

## Dev

You can run both the server and the client in watch mode:

```bash
npm start
```

In development, the frontend runs in a dev server and proxies API requests to the express.js server.

## Production

You can create a production build of the frontend and then run the server to serve the generated static assets.

```bash
npm run build
npm run start:server:production
```

## Notes

Here are some notes regarding the implementation of the app:

- Even if not explicitly stated in the requirements, it felt weird to me to start the app directly on the screen for analysis. That's why I implemented a simple authentication mechanism based on JWT tokens. There is an API that creates JWT tokens (statically) and those are used by the other APIs.
- I have implemented basic logging on the server that could be integrated with something like ElasticSearch.
- I have not used any fancy CSS library, but rather I have kept it simple when it comes to styles.
- I have covered with tests only the "main functionalities", in my opinion, the API that does the analysis and the frontend component that determines the maximum profit.
- On same places in the code I have left notes how the code could be changed to make the app "more production-ready"
