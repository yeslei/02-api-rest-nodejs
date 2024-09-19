import { knex as setupKnex } from 'knex'
import config from '../knexfile'

const knexConfig = config

export const knex = setupKnex(knexConfig)
