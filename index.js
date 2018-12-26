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
const logger = require('./lib/logger').child({ type: 'index' })

const client = new Twitter({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
})

const botQueue = async.queue(async function(sourceTweet) {
  logger.info({
    screen_name: sourceTweet.user.screen_name,
    id: sourceTweet.id_str
  })

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

  if (!votedToEmily) {
    return await tweet(
      client,
      createTweet('failure', {
        screen_name: sourceTweet.user.screen_name,
        in_reply_to_status_id: sourceTweet.id_str
      })
    )
  }

  return await tweet(
    client,
    createTweet('success', {
      screen_name: sourceTweet.user.screen_name,
      in_reply_to_status_id: sourceTweet.id_str
    })
  )
}, 1)

function main() {
  const search = client.stream('statuses/filter', {
    track: process.env.HASHTAG
  })
  search.on('data', event => {
    try {
      setTimeout(function() {
        botQueue.push(event)
      }, 10 * 1000)
    } catch (e) {
      console.log(JSON.stringify(e))
    }
  })

  search.on('error', event => {
    logger.error(event, 'search failed')
  })
}

main()
