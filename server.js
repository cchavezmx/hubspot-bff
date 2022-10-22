import { ApolloServer } from 'apollo-server-express'
import express from 'express'
import * as dotenv from 'dotenv'

import Keyv from 'keyv'
import { KeyvAdapter } from '@apollo/utils.keyvadapter'
import { typeDefs } from './graphql/schema.js'
import { resolvers } from './graphql/resolvers/index.js'
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core'

import http from 'http'
dotenv.config()
const PORT = process.env.PORT || 4000

async function startApolloServer () {
  const app = express()
  const httpServer = http.createServer(app)
  const server = new ApolloServer({
    typeDefs,
    resolvers: {
      Query: resolvers.Query,
      Mutation: resolvers.Mutation
    },
    // context: async ({ req }) => ({ token: req.headers.token }),
    cache: new KeyvAdapter(new Keyv(process.env.REDIS_URL)),
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    introspection: true,
    playground: true
  })

  await server.start()
  server.applyMiddleware({ app, path: '/api' })
  await new Promise((resolve) => httpServer.listen({ port: PORT }, resolve))
  console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`)
}

startApolloServer()
