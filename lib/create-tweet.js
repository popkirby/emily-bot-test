const fs = require('fs-extra')
const yaml = require('js-yaml')
const path = require('path')
const { parse, isBefore } = require('date-fns')

const START_DATE = parse('2018-12-31T10:08:00+09:00')
const MID_DATE = parse('2019-01-01T00:00:00+09:00')
const END_DATE = parse('2019-01-01T22:08:00+09:00')

const templates = yaml.safeLoad(
  fs.readFileSync(path.resolve(__dirname, '../templates.yaml'))
)

function getRandomInt(max) {
  return Math.floor(Math.random() * max)
}

function createTweetText(text, screen_name, voted, now) {
  const tweetText = isBefore(now, MID_DATE)
    ? `${text}良いお年をお迎えください～。`
    : `明けましておめでとうございます。${text}`
  return `@${screen_name} ${voted ? '∬(*^ヮ^)∬＜' : "∬(*'ヮ')∬＜"}${tweetText}`
}

async function createTweet(tweetText, screen_name, voted, hatch) {
  if (hatch) {
    return templates.hatch
  }

  let type
  if (tweetText.includes('煩悩')) {
    type = 'bonnou'
  } else if (tweetText.includes('反省')) {
    type = 'hansei'
  } else if (tweetText.includes('抱負')) {
    type = 'houhu'
  } else if (tweetText.includes('願い')) {
    type = 'negai'
  } else {
    type = 'default'
  }

  const templateBase = templates[type][voted]
  const template = templateBase[getRandomInt(templateBase.length)]

  return {
    text: createTweetText(template.text, screen_name, voted, Date.now()),
    image: template.image
  }
}

module.exports = createTweet
