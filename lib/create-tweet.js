const fs = require('fs-extra')
const yaml = require('js-yaml')
const path = require('path')
const { parse, isAfter } = require('date-fns')

const END_DATE = parse('2018-12-29T00:00:00+09:00')

const templates = yaml.safeLoad(
  fs.readFileSync(path.resolve(__dirname, '../templates.yaml'))
)

function getRandomInt(max) {
  return Math.floor(Math.random() * max)
}

function createTweet(type, { screen_name, in_reply_to_status_id }) {
  if (isAfter(Date.now(), END_DATE)) {
    return {
      text: `∬(*'ヮ')∬＜賑やかで楽しい歳の市でした♪仕掛け人さまも、楽しかったでしょうか？`,
      screen_name,
      in_reply_to_status_id
    }
  }

  const template = templates[type][getRandomInt(templates[type].length)]
  const text =
    type === 'success'
      ? `@${screen_name} ∬(*'ヮ')∬＜${template.text}`
      : `@${screen_name} ∬(*>_<)∬＜${template.text}`

  return {
    text,
    image: template.image,
    screen_name,
    in_reply_to_status_id
  }
}

module.exports = createTweet
