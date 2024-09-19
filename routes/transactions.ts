import { FastifyInstance } from 'fastify'
import { knex } from '../src/database'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { sessionIdExist } from '../middleware/session-id-exist'

export async function transctionsRoutes(app: FastifyInstance) {
  app.post('/', async (req, res) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    let sessionId = req.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      res.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 Dias
      })
    }

    const { title, amount, type } = createTransactionBodySchema.parse(req.body)

    await knex('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId,
    })

    return res.status(201).send()
  })

  app.get(
    '/',
    {
      preHandler: [sessionIdExist],
    },
    async (req, res) => {
      const { sessionId } = req.cookies
      const transactions = await knex('transactions')
        .where('session_id', sessionId)
        .select()

      return res.status(200).send({ transactions })
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [sessionIdExist],
    },
    async (req, res) => {
      const getTransationParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getTransationParamsSchema.parse(req.params)
      const { sessionId } = req.cookies
      const transaction = await knex('transactions')
        .where({
          id,
          session_id: sessionId,
        })
        .first()

      return res.status(200).send({ transaction })
    },
  )

  app.get(
    '/summary',
    {
      preHandler: [sessionIdExist],
    },
    async (req, res) => {
      const { sessionId } = req.cookies
      const summary = await knex('transactions')
        .where('session_id', sessionId)
        .sum('amount', { as: 'amount' })
        .first()
      return { summary }
    },
  )
}
