const vision = require('@google-cloud/vision')
const logger = require('./logger').child({ type: 'did-voted-to-emily' })

const visionClient = new vision.ImageAnnotatorClient()

async function didVotedToEmily(url) {
  try {
    const [result] = await visionClient.textDetection(url)
    const texts = result.textAnnotations

    return (
      texts.find(annotation =>
        annotation.description.includes('投票しました')
      ) !== null
    )
  } catch (e) {
    logger.error(e, 'didVotedEmily failed')
    return false
  }
}

module.exports = didVotedToEmily
