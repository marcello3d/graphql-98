# GraphQL ‘98 Browser

GraphQL ‘98 Browser is an open source visual GraphQL data browser. Inspired by
SQL GUIs like [Postico](https://eggerapps.at/postico/) and
[Tableplus](https://tableplus.com).

Start by trying the [Live demo](https://graphql-98.vercel.app)

## Why?

I've wanted to learn more about GraphQL, and one thing that I've always
stumbled on is [GraphiQL](https://github.com/graphql/graphiql)'s
programming-oriented approach to GraphQL.

I wanted something that lets me _see_ the data without typing queries.

## Tech I'm using

None of this would be possible without open source libraries to build on top of:

- Frontend
  - [React](https://reactjs.org) for UI framework
  - [98.css](https://jdan.github.io/98.css/) for visual theme
  - [graphql-hooks](https://github.com/nearform/graphql-hooks) for GraphQL querying
  - [viz.js](https://github.com/mdaines/viz.js) for rendering schema diagram
- Environment
  - [Create React App](https://reactjs.org/docs/create-a-new-react-app.html) for webpack + eslint + bundling
  - [TypeScript](https://www.typescriptlang.org) for type checking
  - [Prettier](https://prettier.io) for code formatting
  - [Vercel](http://vercel.com/) for deployment

## Development

Run with `yarn dev`
