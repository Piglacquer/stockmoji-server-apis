const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()
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

app.listen(process.env.PORT || 3001, () => console.log('listening on port 3001!'))

let sentiment

function analyze(document) {
	client
		.analyzeSentiment({ document: document })
		.then(results => {
			console.log(results)
			sentiment = results[0].documentSentiment
			return results
		})
		.then()
		.catch(err => {
			console.error('ERROR:', err)
		})
}

// var params = {
// 	q: 'nvda',
// 	count: 100
// }

app.get('/:ticker', (request, response, next) => {
	var params = request.params.ticker
	console.log(request.params.ticker)
	twitClient.get('search/tweets', params, (error, tweets, twitterResponse) => {
		if (error) {
			next(error)
		} else {
			console.log(tweets)
			response.send({ tweets })
		}
	})
})

app.post('/', (req, res) => {
	analyze(req.body)
	setTimeout(() => {
		res.send({ message: sentiment })
	}, 500)
})
