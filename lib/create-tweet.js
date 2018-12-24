const fs = require('fs-extra')
const yaml = require('js-yaml')
const path = require('path')

const { templates } = yaml.safeLoad(
  fs.readFileSync(path.resolve(__dirname, '../templates.yaml'))
)

function getRandomInt(max) {
  return Math.floor(Math.random() * max)
}

function createTweet({ screen_name, in_reply_to_status_id }) {
  const template = templates[getRandomInt(templates.length)]

  return {
    text: template.text,
    image: template.image,
    screen_name,
    in_reply_to_status_id
  }
}

module.exports = createTweet
