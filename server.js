import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import * as dotenv from 'dotenv'
dotenv.config()

import { Query } from './graphql/resolvers/query.js';
import { typeDefs } from './graphql/schema.js';

const server = new ApolloServer({
  typeDefs,
  resolvers: {
    Query,
  },
  playground: true,
  introspection: true,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);