const vision = require('@google-cloud/vision')
const logger = require('./logger').child({ type: 'did-voted-to-emily' })

let visionClient

async function didVotedToEmily(url) {
  try {
    visionClient = visionClient || new vision.ImageAnnotatorClient()
    const [result] = await visionClient.textDetection(url)
    const texts = result.textAnnotations

    return texts.some(
      annotation =>
        annotation.description.includes('エミリー') &&
        annotation.description.includes('投票') &&
        annotation.description.includes('しました')
    )
  } catch (e) {
    logger.error(e, 'didVotedEmily failed')
    return false
  }
}

module.exports = didVotedToEmily
