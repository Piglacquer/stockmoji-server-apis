const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()
const language = require('@google-cloud/language')
const client = new language.LanguageServiceClient()
// {
// projectId: 'capstone-biffle',
// credentials: {
// 	private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
// 	client_email: process.env.GOOGLE_CLIENT_EMAIL
// }
// }

// const Twitter = require('twitter')
// const twitClient = new Twitter({
// 	consumer_key: process.env.CONSUMER_KEY,
// 	consumer_secret: process.env.CONSUMER_SECRET,
// 	access_token_key: process.env.ACCESS_TOKEN,
// 	access_token_secret: process.env.ACCESS_TOKEN_SECRET
// })
app.use(bodyParser.json())
app.use(cors())

// function authorize() {
// 	return new Promise(resolve => {
// 		const authFactory = new googleAuth()
// 		const jwtClient = new authFactory.JWT(
// 			process.env.GOOGLE_CLIENT_EMAIL,
// 			null,
// 			process.env.GOOGLE_PRIVATE_KEY,
// 			['https://language.googleapis.com']
// 		)
// 		jwtClient.authorize(() => resolve(jwtClient))
// 	})
// }

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

// app.get('/', (request, response, next) => {
// 	let params = { id: 23424977 }
// 	twitClient.get('search/tweets.json', params, (error, tweets, twitterResponse) => {
// 		if (error) {
// 			next(error)
// 		} else {
// 			console.log(tweets)
// 			response.send({ tweets })
// 		}
// 	})
// })

app.post('/', (req, res) => {
	console.log(authorize())
	analyze(req.body)
	setTimeout(() => {
		res.send({ message: sentiment })
	}, 500)
})

app.listen(3001 || process.env.PORT, () => console.log('listening on port 3001!'))
