const path = require('path')

require('dotenv').config({
  path:
    process.env.NODE_ENV === 'production'
      ? '/home/emily-bot/vars'
      : path.resolve(__dirname, '.env')
})

const Twitter = require('twitter')
const async = require('async')
const didVotedToEmily = require('./lib/did-voted-to-emily')
const tweet = require('./lib/tweet')
const createTweet = require('./lib/create-tweet')
const checkTweetCount = require('./lib/check-tweet-count')
const _logger = require('./lib/logger')
const { parse, isBefore, isAfter } = require('date-fns')

const START_DATE = parse('2018-12-31T10:08:00+09:00')
const END_DATE = parse('2019-01-01T22:08:00+09:00')

const client = new Twitter({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
})

async function queueCreator(sourceTweet) {
  const screen_name = sourceTweet.user.screen_name

  const logger = _logger.child({
    screen_name: screen_name,
    id: sourceTweet.id_str,
    type: 'index'
  })

  if (isBefore(Date.now(), START_DATE) || isAfter(Date.now(), END_DATE)) {
    logger.info('bot is not running')
    return
  }

  const text = sourceTweet.extended_tweet
    ? sourceTweet.extended_tweet.full_text || ''
    : sourceTweet.text

  if (text.includes(process.env.SUPPRESS_WORD)) {
    logger.info('tweet suppressed')
    return
  }

  if (
    sourceTweet.retweeted_status != null ||
    sourceTweet.quoted_status != null
  ) {
    logger.info('retweeted')
    return
  }

  if (!(await checkTweetCount(sourceTweet.user.id_str))) {
    logger.info('tweet >3 times')
    return
  }

  let votedToEmily = false
  if (sourceTweet.entities && sourceTweet.entities.media) {
    votedToEmily = sourceTweet.entities.media.some(
      async entity => await didVotedToEmily(entity.media_url)
    )
  }

  if (!text.includes('@tc_emily_proj')) {
    if (votedToEmily) {
      logger.info('hatch')
      return await tweet(client, {
        ...createTweet(text, screen_name, votedToEmily, true),
        in_reply_to_status_id: sourceTweet.id_str
      })
    } else {
      logger.info('not reply')
      return
    }
  }

  logger.info('tweet')
  return await tweet(client, {
    ...createTweet(text, screen_name, votedToEmily),
    in_reply_to_status_id: sourceTweet.id_str
  })
}

const botQueue = async.queue(queueCreator, 1)

function main() {
  const search = client.stream('statuses/filter', {
    track: process.env.HASHTAG
  })

  search.on('data', event => {
    setTimeout(function() {
      botQueue.push(event)
    }, 10 * 1000)
  })

  search.on('error', event => {
    _logger.error(event, 'search failed')
  })
}

main()

module.exports = queueCreator
