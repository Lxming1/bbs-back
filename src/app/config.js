const env = require('dotenv')
const fs = require('fs')

const PRIVATE_KEY = fs.readFileSync('src/app/keys/private.key')
const PUBLIC_KEY = fs.readFileSync('src/app/keys/public.key')
env.config()

module.exports = {
  APP_HOST,
  APP_PORT,
  MYSQL_HOST,
  MYSQL_PORT,
  MYSQL_DATABASE,
  MYSQL_USERNAME,
  MYSQL_PASSWORD,
  REDIS_PORT,
  REDIS_HOST,
  MY_EMAIL,
  MY_EMAIL_PASS,
} = process.env

module.exports.PRIVATE_KEY = PRIVATE_KEY
module.exports.PUBLIC_KEY = PUBLIC_KEY
