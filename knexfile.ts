import type { Knex } from 'knex'
import { env } from './src/env'

const config: Knex.Config = {
  client: env.DATABASE_CLIENT,
  connection: env.DATABASE_CLIENT === 'sqlite'?{
    filename: env.DATABASE_URL,
  }:  env.DATABASE_URL,
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './db/migrations',
  },
}

export default config
