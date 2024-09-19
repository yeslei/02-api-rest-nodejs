import fastify from 'fastify'
import crypto from 'node:crypto'
import { knex } from './database'
import { env } from './env/index.ts'
import { transctionsRoutes } from '../routes/transactions'
import cookie from '@fastify/cookie'

const port = env.PORT
export const app = fastify()

app.addHook('preHandler', async (req, res) => {
  console.log(`${req.method}${req.url}`)
})

app.get('/', (req, res) => {
  return res.send()
})

app.register(cookie)

app.register(transctionsRoutes, {
  prefix: 'transactions',
})
