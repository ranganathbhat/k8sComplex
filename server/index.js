const keys = require("./keys");

// Express App Setup
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Postgres Client Setup
const { Pool } = require("pg");
const pgCli = new Pool({
  user: keys.pgUser,  
  host: keys.pgHost,  
  database: keys.pgDatabase,  
  password: keys.pgPwd,
  port: keys.pgPort
});

pgCli.on("connect", (client) => {
  client
    .query("CREATE TABLE IF NOT EXISTS values (number INT)")
    .catch((err) => console.error(err));
});

// Redis Client Setup
const redis = require("redis");
const redisCli = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000,
  // if redis connection lost, then retry after 1000ms
});
const redisPublish = redisCli.duplicate();

// Express route handlers

app.get("/", (req, res) => {
  res.send("Hi");
});

app.get("/values/all", async (req, res) => {
  const values = await pgCli.query("SELECT * from values");
  res.send(values.rows);
});

app.get("/values/current", async (req, res) => {
  redisCli.hgetall("values", (err, values) => {
    res.send(values);
    // used in callback function instead of await.
  });
});

app.post("/values", async (req, res) => {
  const index = req.body.index;

  if(parseInt(index)>40) {
    return res.status(422).send("Index too high");
  }

  redisCli.hset("values", index, "empty!");
  redisPublish.publish("insert", index);
  pgCli.query("INSERT INTO values(number) VALUES($1)", [index]);

  res.send({working: true});
});

app.listen(5000, (err) => {
  console.log("Listening");
});
