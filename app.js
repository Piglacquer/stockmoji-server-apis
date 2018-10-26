const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 3001

const language = require('@google-cloud/language')
const client = new language.LanguageServiceClient({
	projectId: process.env.PROJECT_ID,
	credentials: {
		private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
		client_email: process.env.CLIENT_EMAIL
	}
})

const Twitter = require('twitter')
const twitClient = new Twitter({
	consumer_key: process.env.TWITTER_CONSUMER_KEY,
	consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
	access_token_key: process.env.TWITTER_ACCESS_TOKEN,
	access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
})

app.use(bodyParser.json())
app.use(cors())

app.listen(port, () => console.log(`listening on port ${port}`))

let sentiment

function analyze(document) {
	new Promise((resolve, reject) => client
		.analyzeSentiment({ document: document })
		.then(results => {
			console.log(results)
			return resolve(results[0].documentSentiment)})
		// 	{
		// 	sentiment = results[0].documentSentiment
		// 	return results
		// })
		.catch(err => {
			reject({"error": err})
			console.error('ERROR:', err)
		})
	)
}

app.get('/:ticker', (request, response, next) => {
	var params = {
		q: request.params.ticker,
		count: 100,
		lang: 'en'
	}
	twitClient.get('search/tweets', params, (error, tweets, twitterResponse) => {
		if (error) {
			next(error)
		} else {
			response.send({ tweets })
		}
	})
})

app.post('/', (req, res) => {
	analyze(req.body)
	.then(results => res.send({message: results}))
	// setTimeout(() => {
	// 	res.send({ message: sentiment })
	// }, 500)
})
