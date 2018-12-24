const fs = require('fs-extra')
const yaml = require('js-yaml')
const path = require('path')

const templates = yaml.safeLoad(
  fs.readFileSync(path.resolve(__dirname, '../templates.yaml'))
)

function getRandomInt(max) {
  return Math.floor(Math.random() * max)
}

function createTweet(type, { screen_name, in_reply_to_status_id }) {
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
