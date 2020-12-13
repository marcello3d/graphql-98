import React from 'react';

import { SampleUrls } from './SampleUrls';

export const WhatIsThis = (
  <div className="window">
    <div className="title-bar">
      <div className="title-bar-text">What is this?</div>
    </div>
    <main className="window-body">
      <p>
        GraphQL ‘98 is an open-source visual data explorer. Inspired by SQL GUIs
        like <a href="https://tableplus.com">TablePlus</a> and{' '}
        <a href="https://www.phpmyadmin.net">phpMyAdmin</a>, but designed for
        GraphQL.
      </p>
      <h2>Why?</h2>
      <p>
        I'm in the process of learning more about GraphQL.{' '}
        <a href="https://github.com/graphql/graphiql">GraphiQL</a> and{' '}
        <a href="https://github.com/prisma-labs/graphql-playground">
          GraphQL Playground
        </a>{' '}
        are great at providing a command-line/programming interface to GraphQL.
        But I wanted something that lets me <i>see</i> the data without typing
        queries.
      </p>

      <h2>Quick start</h2>
      <p>
        Here are some public GraphQL endpoints to try courtesy of{' '}
        <a href="https://github.com/APIs-guru/graphql-apis">APIs-guru</a>:
      </p>
      <SampleUrls />
    </main>
  </div>
);
