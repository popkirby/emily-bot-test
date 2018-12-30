const fs = require('fs-extra')
const yaml = require('js-yaml')
const path = require('path')
const { parse, isBefore } = require('date-fns')

const MID_DATE = parse('2019-01-01T00:00:00+09:00')

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

function createTweet(tweetText, screen_name, voted, now, hatch) {
  if (hatch) {
    return {
      image: templates.hatch.image,
      text: createTweetText(templates.hatch.text, screen_name, voted, now)
    }
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

  const templateBase = templates[type][voted ? 'with' : 'without']
  const template = templateBase[getRandomInt(templateBase.length)]

  return {
    text: createTweetText(template.text, screen_name, voted, now),
    image: template.image
  }
}

module.exports = createTweet
