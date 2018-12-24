const vision = require('@google-cloud/vision')

const visionClient = new vision.ImageAnnotatorClient()

async function didVotedToEmily(url) {
  const [result] = await visionClient.textDetection(url)
  const texts = result.textAnnotations

  return (
    texts.find(
      annotation =>
        annotation.description.includes('エミリー') &&
        annotation.description.includes('投票しました')
    ) !== null
  )
}

module.exports = didVotedToEmily
