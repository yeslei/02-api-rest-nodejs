import { test, beforeAll, afterAll, beforeEach, describe, expect } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import { title } from 'process'
import { execSync } from 'node:child_process'

describe('Transactions Test Routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  test('O usuario consegue criar uma nova transacao', async () => {
    const response = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New Transaction',
        amount: 232,
        type: 'credit',
      })
      .expect(201)
  })

  test('O usuario deve conseguir listar as suas transacoes', async () => {
    const response = await request(app.server).post('/transactions').send({
      title: 'New Transaction',
      amount: 232,
      type: 'credit',
    })

    const cookies = response.get('Set-Cookie')

    const responseGetRequisition = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

    expect(responseGetRequisition.body.transactions).toEqual([
      expect.objectContaining({
        title: 'New Transaction',
        amount: 232,
      }),
    ])
  })

  test('O usuario deve conseguir listar uma transacao especifica', async () => {
    const response = await request(app.server).post('/transactions').send({
      title: 'New Transaction',
      amount: 232,
      type: 'credit',
    })

    const cookies = response.get('Set-Cookie')

    const responseGetRequisition = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

    expect(responseGetRequisition.body.transactions).toEqual([
      expect.objectContaining({
        title: 'New Transaction',
        amount: 232,
      }),
    ])

    const transactionId = responseGetRequisition.body.transactions[0].id

    const responseGetRequisition2 = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(responseGetRequisition2.body.transaction).toEqual(
      expect.objectContaining({
        title: 'New Transaction',
        amount: 232,
      }),
    )
  })

  test('O usuario deve conseguir listar o resumo da sua conta', async () => {
    const response = await request(app.server).post('/transactions').send({
      title: 'New Transaction',
      amount: 232,
      type: 'credit',
    })

    const cookies = response.get('Set-Cookie')

    await request(app.server)
      .post('/transactions')
      .set('Cookie', cookies)
      .send({
        title: 'Nova',
        amount: 231,
        type: 'debit',
      })

    const responseGetRequisition = await request(app.server)
      .get('/transactions/summary')
      .set('Cookie', cookies)
      .expect(200)

    expect(responseGetRequisition.body.summary).toEqual(
      expect.objectContaining({
        amount: 1,
      }),
    )
  })
})
