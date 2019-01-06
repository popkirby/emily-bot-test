import test from 'ava'
import proxyquire from 'proxyquire'
import { parse } from 'date-fns'

class TwitterStub {
  tweet() {}
}

test('queue-creator:suppress', async t => {
  const queueCreator = proxyquire.noCallThru().load('../index', {
    Twitter: function() {},
    './lib/did-voted-to-emily': async function() {}
  })

  t.true(
    (await queueCreator({
      sourceTweet: { text: '#TC企画宣伝', user: { screen_name: 'user1' } },
      now: parse('2018-12-31T12:00:00+09:00')
    })) === 'tweet suppressed'
  )

  t.true(
    (await queueCreator({
      sourceTweet: {
        extended_tweet: { full_text: '#TC企画宣伝' },
        user: { screen_name: 'user1' }
      },
      now: parse('2018-12-31T12:00:00+09:00')
    })) === 'tweet suppressed'
  )
})

test('queue-creator:retweet', async t => {
  const queueCreator = proxyquire.noCallThru().load('../index', {
    Twitter: function() {},
    './lib/did-voted-to-emily': async function() {}
  })

  t.true(
    (await queueCreator({
      sourceTweet: {
        text: '',
        user: { screen_name: 'user1' },
        retweeted_status: {}
      },
      now: parse('2018-12-31T12:00:00+09:00')
    })) === 'retweeted'
  )

  t.true(
    (await queueCreator({
      sourceTweet: {
        text: '',
        user: { screen_name: 'user1' },
        quoted_status: {}
      },
      now: parse('2018-12-31T12:00:00+09:00')
    })) === 'retweeted'
  )
})

test('queue-creator:tweetCount', async t => {
  const queueCreator = proxyquire.noCallThru().load('../index', {
    Twitter: function() {},
    './lib/did-voted-to-emily': async function() {
      return true
    },
    './lib/check-tweet-count': async function() {
      return false
    }
  })

  t.true(
    (await queueCreator({
      sourceTweet: {
        text: '@tc_emily_proj',
        user: { screen_name: 'user1' },
        entities: { media: [{ media_url: '' }] }
      },
      now: parse('2018-12-31T12:00:00+09:00')
    })) === 'tweet >3 times'
  )
})

test('queue-creator:tweetCount:2', async t => {
  const queueCreator = proxyquire.noCallThru().load('../index', {
    Twitter: function() {},
    './lib/did-voted-to-emily': async function() {
      return true
    },
    './lib/check-tweet-count': async function() {
      return false
    }
  })

  t.true(
    (await queueCreator({
      sourceTweet: {
        text: '',
        user: { screen_name: 'user1' },
        entities: { media: [{ media_url: '' }] }
      },
      now: parse('2018-12-31T12:00:00+09:00')
    })) === 'not reply'
  )
})

test('queue-creator:not-vote', async t => {
  const queueCreator = proxyquire.noCallThru().load('../index', {
    Twitter: new TwitterStub(),
    './lib/did-voted-to-emily': async function() {
      return false
    },
    './lib/check-tweet-count': async function() {
      return true
    },
    './lib/tweet': async function() {}
  })

  t.true(
    (await queueCreator({
      sourceTweet: {
        text: '',
        user: { screen_name: 'user1' },
        entities: { media: [{ media_url: '' }] }
      },
      now: parse('2018-12-31T12:00:00+09:00')
    })) === 'not vote'
  )
})

test('queue-creator:not-reply', async t => {
  const queueCreator = proxyquire.noCallThru().load('../index', {
    Twitter: new TwitterStub(),
    './lib/did-voted-to-emily': async function() {
      return true
    },
    './lib/check-tweet-count': async function() {
      return true
    },
    './lib/tweet': async function() {}
  })

  t.true(
    (await queueCreator({
      sourceTweet: {
        text: '',
        user: { screen_name: 'user1' },
        entities: { media: [{ media_url: '' }] }
      },
      now: parse('2018-12-31T12:00:00+09:00')
    })) === 'not reply'
  )
})

test('queue-creator:tweet', async t => {
  const queueCreator = proxyquire.noCallThru().load('../index', {
    Twitter: new TwitterStub(),
    './lib/did-voted-to-emily': async function() {
      return true
    },
    './lib/check-tweet-count': async function() {
      return true
    },
    './lib/tweet': async function() {}
  })

  t.true(
    (await queueCreator({
      sourceTweet: {
        text: '@tc_emily_proj',
        user: { screen_name: 'user1' },
        entities: { media: [{ media_url: '' }] }
      },
      now: parse('2018-12-31T12:00:00+09:00')
    })) === 'tweet'
  )
})
