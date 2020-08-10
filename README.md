# GraphQL ‘98 Browser

GraphQL ‘98 Browser is an open source visual GraphQL data browser. Inspired by
tools like [Postico](https://eggerapps.at/postico/) and
[Tableplus](https://tableplus.com) but for GraphQL.

Start by trying the [Live demo](https://graphql-98.vercel.app)

## Why?

I've wanted to learn more about GraphQL, and one thing that I've always
stumbled on is [GraphiQL](https://github.com/graphql/graphiql)'s very
programming-oriented approach to GraphQL.

I wanted something that actually lets me _see_ the data.

## Tech I'm using

None of this would be possible without open source libraries to build on top of:

- Environment
  - [Create React App](https://reactjs.org/docs/create-a-new-react-app.html) for handling React + eslint + bundling
  - [TypeScript](https://www.typescriptlang.org) for type checking
  - [Prettier](https://prettier.io) for code formatting
  - [Vercel](http://vercel.com/) for deployment
- Frontend
  - [React](https://reactjs.org) for UI rendering
  - [graphql-hooks](https://github.com/nearform/graphql-hooks) for GraphQL querying
  - [98.css](https://jdan.github.io/98.css/) for UI theme

## Development

Run with `yarn dev`
