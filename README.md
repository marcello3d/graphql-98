# GraphQL ‘98: GraphQL Data Explorer

GraphQL ‘98 is a data explorer for GraphQL. Inspired by
SQL GUIs like [phpMyAdmin](https://www.phpmyadmin.net) and
[Tableplus](https://tableplus.com), but designed for GraphQL APIs.

## [Download now!](https://github.com/marcello3d/graphql-98/releases/latest)

## Why?

I'm in the process of learning more about GraphQL.
[GraphiQL](https://github.com/graphql/graphiql) and
[GraphQL Playground](https://github.com/prisma-labs/graphql-playground)
are great at providing a command-line/programming interface to GraphQL.
But I wanted something that lets me _see_ the data without typing
queries.

## Tech I'm using

None of this would be possible without open source libraries to build on top of:

- Frontend
  - [React](https://reactjs.org) for UI framework
  - [98.css](https://jdan.github.io/98.css/) for visual theme
  - [graphql-hooks](https://github.com/nearform/graphql-hooks) for GraphQL querying
  - [viz.js](https://github.com/mdaines/viz.js) for rendering schema diagrams
- Environment
  - [Electron](https://electronjs.org) for running the page as a multi-window desktop app
  - [Electron Forge](https://www.electronforge.io) for bundling/packaging/publishing the app
  - [TypeScript](https://www.typescriptlang.org) for type checking
  - [Prettier](https://prettier.io) for code formatting
  - [Vercel](http://vercel.com/) for deployment

## Development

Run with `yarn start`
