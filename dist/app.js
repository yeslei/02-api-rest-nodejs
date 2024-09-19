"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/app.ts
var app_exports = {};
__export(app_exports, {
  app: () => app
});
module.exports = __toCommonJS(app_exports);
var import_fastify = __toESM(require("fastify"));

// src/env/index.ts
var import_dotenv = require("dotenv");
var import_zod = require("zod");
if (process.env.NODE_ENV === "test") {
  (0, import_dotenv.config)({ path: ".env.test" });
} else {
  (0, import_dotenv.config)();
}
var envSchema = import_zod.z.object({
  NODE_ENV: import_zod.z.enum(["development", "production", "test"]).default("production"),
  DATABASE_URL: import_zod.z.string(),
  PORT: import_zod.z.number().default(3e3)
});
var env = envSchema.parse(process.env);

// src/database.ts
var import_knex = require("knex");

// knexfile.ts
var config2 = {
  client: "sqlite3",
  connection: {
    filename: env.DATABASE_URL
  },
  useNullAsDefault: true,
  migrations: {
    extension: "ts",
    directory: "./db/migrations"
  }
};
var knexfile_default = config2;

// src/database.ts
var knexConfig = knexfile_default;
var knex = (0, import_knex.knex)(knexConfig);

// routes/transactions.ts
var import_zod2 = require("zod");
var import_crypto = require("crypto");

// middleware/session-id-exist.ts
async function sessionIdExist(req, res) {
  const sessionId = req.cookies.sessionId;
  if (!sessionId) {
    return res.status(401).send({ error: "Unathorized" });
  }
}

// routes/transactions.ts
async function transctionsRoutes(app2) {
  app2.post("/", async (req, res) => {
    const createTransactionBodySchema = import_zod2.z.object({
      title: import_zod2.z.string(),
      amount: import_zod2.z.number(),
      type: import_zod2.z.enum(["credit", "debit"])
    });
    let sessionId = req.cookies.sessionId;
    if (!sessionId) {
      sessionId = (0, import_crypto.randomUUID)();
      res.cookie("sessionId", sessionId, {
        path: "/",
        maxAge: 1e3 * 60 * 60 * 24 * 7
        // 7 Dias
      });
    }
    const { title, amount, type } = createTransactionBodySchema.parse(req.body);
    await knex("transactions").insert({
      id: (0, import_crypto.randomUUID)(),
      title,
      amount: type === "credit" ? amount : amount * -1,
      session_id: sessionId
    });
    return res.status(201).send();
  });
  app2.get(
    "/",
    {
      preHandler: [sessionIdExist]
    },
    async (req, res) => {
      const { sessionId } = req.cookies;
      const transactions = await knex("transactions").where("session_id", sessionId).select();
      return res.status(200).send({ transactions });
    }
  );
  app2.get(
    "/:id",
    {
      preHandler: [sessionIdExist]
    },
    async (req, res) => {
      const getTransationParamsSchema = import_zod2.z.object({
        id: import_zod2.z.string().uuid()
      });
      const { id } = getTransationParamsSchema.parse(req.params);
      const { sessionId } = req.cookies;
      const transaction = await knex("transactions").where({
        id,
        session_id: sessionId
      }).first();
      return res.status(200).send({ transaction });
    }
  );
  app2.get(
    "/summary",
    {
      preHandler: [sessionIdExist]
    },
    async (req, res) => {
      const { sessionId } = req.cookies;
      const summary = await knex("transactions").where("session_id", sessionId).sum("amount", { as: "amount" }).first();
      return { summary };
    }
  );
}

// src/app.ts
var import_cookie = __toESM(require("@fastify/cookie"));
var port = env.PORT;
var app = (0, import_fastify.default)();
app.addHook("preHandler", async (req, res) => {
  console.log(`${req.method}${req.url}`);
});
app.get("/", (req, res) => {
  return res.send();
});
app.register(import_cookie.default);
app.register(transctionsRoutes, {
  prefix: "transactions"
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  app
});
