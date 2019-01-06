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

const client = new Twitter({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
})

async function queueCreator({ sourceTweet }) {
  const screen_name = sourceTweet.user.screen_name

  const logger = _logger.child({
    screen_name: screen_name,
    id: sourceTweet.id_str,
    type: 'index'
  })

  const text = sourceTweet.extended_tweet
    ? sourceTweet.extended_tweet.full_text || ''
    : sourceTweet.text

  if (text.includes(process.env.SUPPRESS_WORD)) {
    logger.info('tweet suppressed')
    return 'tweet suppressed'
  }

  if (
    sourceTweet.retweeted_status != null ||
    sourceTweet.quoted_status != null
  ) {
    logger.info('retweeted')
    return 'retweeted'
  }

  let votedToEmily = false
  if (sourceTweet.entities && sourceTweet.entities.media) {
    for (let media of sourceTweet.entities.media) {
      if (await didVotedToEmily(media.media_url)) {
        votedToEmily = true
        break
      }
    }
  }

  if (!votedToEmily) {
    logger.info('not vote')
    return 'not vote'
  }

  if (!text.includes('@tc_emily_proj')) {
    logger.info('not reply')
    return 'not reply'
  }

  if (!(await checkTweetCount(sourceTweet.user.id_str))) {
    logger.info('tweet >3 times')
    return 'tweet >3 times'
  }

  await tweet(client, {
    ...createTweet(text, screen_name),
    in_reply_to_status_id: sourceTweet.id_str
  })
  logger.info('tweet')
  return 'tweet'
}

const botQueue = async.queue(queueCreator, 1)

function main() {
  const search = client.stream('statuses/filter', {
    track: process.env.HASHTAG
  })

  search.on('data', event => {
    setTimeout(function() {
      botQueue.push({ sourceTweet: event })
    }, 10 * 1000)
  })

  search.on('error', event => {
    _logger.error(event, 'search failed')
  })
}

if (require.main === module) {
  main()
}

module.exports = queueCreator
