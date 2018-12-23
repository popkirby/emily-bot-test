const Twitter = require('twitter')
const vision = require('@google-cloud/vision')
const mustache = require('mustache')
const fs = require('fs-extra')
require('dotenv').config()

const defaultTemplate = fs.readFileSync('./templates/default.mustache', 'utf-8')
const votedTemplate = fs.readFileSync('./templates/voted.mustache', 'utf-8')

mustache.parse(defaultTemplate)
mustache.parse(votedTemplate)

const visionClient = new vision.ImageAnnotatorClient()

const client = new Twitter({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
})

async function didVotedToEmily(url) {
  const [result] = await visionClient.textDetection(url)
  const texts = result.textAnnotations

  return (
    texts.find(
      annotation =>
        annotation.description.includes('エミリー') &&
        annotation.description.includes('投票しました')
    ) !== null
  )
}

async function uploadImage(path) {
  try {
    const data = await fs.readFile(path)
    const media = await client.post('media/upload', { media: data })
    return media.media_id_string
  } catch (e) {
    console.log(JSON.stringify(e))
  }
}

async function tweet(source) {
  console.log(source.text)
  let votedToEmily = false
  if (source.entities && source.entities.media) {
    votedToEmily = source.entities.media.some(
      async entity => await didVotedToEmily(entity.media_url)
    )
  }

  let tweetEntity
  if (votedToEmily) {
    tweetEntity = {
      in_reply_to_status_id: source.id_str,
      status:
        `@${source.user.screen_name} ` +
        mustache.render(votedTemplate, { text: 'voted' }),
      media_ids: await uploadImage('./images/image1.png')
    }
  } else {
    tweetEntity = {
      in_reply_to_status_id: source.id_str,
      status:
        `@${source.user.screen_name} ` +
        mustache.render(defaultTemplate, { text: 'default' }),
      media_ids: await uploadImage('./images/image2.png')
    }
  }

  console.log(JSON.stringify(tweetEntity))

  try {
    await client.post('statuses/update', tweetEntity)
  } catch (e) {
    console.log(JSON.stringify(e))
  }
}

function main() {
  const search = client.stream('statuses/filter', { track: '#テストem123456' })
  search.on('data', event => {
    try {
      console.log(event)
      tweet(event)
    } catch (e) {
      console.log(JSON.stringify(e))
    }
  })

  search.on('error', event => {
    console.log(event)
  })
}

main()
