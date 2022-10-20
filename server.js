import { ApolloServer } from 'apollo-server-express'
import express from 'express'
import * as dotenv from 'dotenv'

import { typeDefs } from './graphql/schema.js'
import { Query } from './graphql/resolvers/query.js'
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
      Query
    },
    // context: async ({ req }) => ({ token: req.headers.token }),
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
