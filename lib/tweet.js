const fs = require('fs-extra')
const path = require('path')

async function uploadImage(client, path) {
  const data = await fs.readFile(path)
  const media = await client.post('media/upload', { media: data })
  return media.media_id_string
}

async function tweet(client, { text, image, in_reply_to_status_id }) {
  let media_ids
  if (image) {
    media_ids = await uploadImage(
      client,
      path.resolve(__dirname, '../images/', image)
    )
  }

  console.log(text, media_ids)
  return await client.post('statuses/update', {
    in_reply_to_status_id,
    status: text,
    media_ids
  })
}

module.exports = tweet
