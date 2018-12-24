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
const path = require('path')
const checkTweetCount = require('./lib/check-tweet-count')

const client = new Twitter({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
})

const botQueue = async.queue(async function(sourceTweet) {
  if (sourceTweet.text.includes(process.env.SUPPRESS_WORD)) {
    return await tweet(
      client,
      createTweet('failure', {
        screen_name: sourceTweet.user.screen_name,
        in_reply_to_status_id: sourceTweet.id_str
      })
    )
  }

  let votedToEmily = false
  if (sourceTweet.entities && sourceTweet.entities.media) {
    votedToEmily = sourceTweet.entities.media.some(
      async entity => await didVotedToEmily(entity.media_url)
    )
  }

  if (!votedToEmily || !(await checkTweetCount(sourceTweet.user.id_str))) {
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
      botQueue.push(event)
    } catch (e) {
      console.log(JSON.stringify(e))
    }
  })

  search.on('error', event => {
    console.log(event)
  })
}

main()
