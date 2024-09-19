import { app } from './app.ts'
import { env } from './env/index.js'

const port = env.PORT

app
  .listen({
    port,
  })
  .then(() => {
    console.log('O servidor esta rodando na porta: ' + port)
  })
