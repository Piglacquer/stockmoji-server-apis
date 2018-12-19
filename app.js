const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const language = require('@google-cloud/language')
const Twitter = require('twitter')
const app = express()
const port = process.env.PORT || 3001

const client = new language.LanguageServiceClient({
  projectId: process.env.PROJECT_ID,
  credentials: {
    private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.CLIENT_EMAIL
  }
})

const twitClient = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
})

app.use(bodyParser.json())
app.use(cors())
app.use(morgan('dev'))

let sentiment

const analyze = (document) => {
  client
    .analyzeSentiment({ document: document })
    .then(results => {
      sentiment = results[0].documentSentiment
      return results
    })
    .catch(err => console.error('ERROR:', err))
}

app.get('/:ticker', (request, response, next) => {
  let params = {
    q: request.params.ticker,
    count: 100,
    lang: 'en'
  }
  twitClient.get('search/tweets', params, (error, tweets, twitterResponse) => {
    if (error) {
      return next(error)
    } else {
      return response.send({ tweets })
    }
  })
})

app.post('/', (req, res) => {
  analyze(req.body)
  setTimeout(() => {
    return res.send({ message: sentiment })
  }, 500)
})

app.use((req, res, next) => {
  console.warn({ 'file not found': req.originalUrl })
  return res.json('NOT FOUND').sendStatus(404)
})

app.use((error, req, res, next) => {
  console.error(error)
  return res.status(403).send({ 'message': error.message })
})

app.listen(port, () => console.log(`listening on port ${port}!`))
