const fs = require('fs-extra')
const path = require('path')
const logger = require('./logger').child({ type: 'tweet' })

async function uploadImage(client, path) {
  try {
    const data = await fs.readFile(path)
    const media = await client.post('media/upload', { media: data })
    return media.media_id_string
  } catch (e) {
    logger.error(e, 'uploadImage failed')
    return
  }
}

async function tweet(client, { text, image, in_reply_to_status_id }) {
  let media_ids
  if (image) {
    media_ids = await uploadImage(
      client,
      path.resolve(__dirname, '../images/', image)
    )
  }

  try {
    return await client.post('statuses/update', {
      in_reply_to_status_id,
      status: text,
      media_ids
    })
  } catch (e) {
    logger.error(e, 'tweet failed')
    return
  }
}

module.exports = tweet
