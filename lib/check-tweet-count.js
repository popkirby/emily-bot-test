const Redis = require('ioredis')

const TTL = 60 * 60 // 1 hour
const MAX_COUNT = 3

const redis = new Redis(
  process.env.REDIS_PORT || 6379,
  process.env.REDIS_HOST || 'localhost'
)

async function checkTweetCount(userId) {
  const count = await redis.get(userId)

  if (count === null) {
    await redis
      .multi()
      .incr(userId)
      .expire(userId, TTL)
    return true
  } else {
    if (count > MAX_COUNT) {
      return false
    } else {
      await redis.incr(userId)
      return true
    }
  }
}

module.exports = checkTweetCount
