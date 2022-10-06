const Redis = require('ioredis')
const { REDIS_HOST, REDIS_PORT } = require('../app/config')

const redis = new Redis({
  port: REDIS_PORT,
  host: REDIS_HOST,
})

module.exports = redis
