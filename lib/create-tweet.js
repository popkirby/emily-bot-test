const fs = require('fs-extra')
const yaml = require('js-yaml')
const path = require('path')

const templates = yaml.safeLoad(
  fs.readFileSync(path.resolve(__dirname, '../templates.yaml'))
).templates

const HEADER = [
  '誕生日をお祝い頂きありがとうございます！ささやかながら、お礼の贈り物をお持ちしました♪',
  '誕生会に来てくださって、本当に嬉しいです！よろしければ、こちらを……♪'
]

const FOOTER = ['ぜひ召し上がってくださいね♪']

function getRandomInt(max) {
  return Math.floor(Math.random() * max)
}

function createTweetText(text, screen_name) {
  const tweetText =
    HEADER[getRandomInt(HEADER.length)] +
    text +
    FOOTER[getRandomInt(FOOTER.length)]

  return `@${screen_name} ${tweetText}`
}

function createTweet(tweetText, screen_name) {
  const template = templates[getRandomInt(templates.length)]

  return {
    text: createTweetText(template.text, screen_name),
    image: template.image
  }
}

module.exports = createTweet
