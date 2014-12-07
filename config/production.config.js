var config = {
	locale: process.env.LOCALE,

	port: process.env.PORT,

	db: {
		connection: process.env.MONGO_CONNECTION,
		aliases: {
			user: "citizens"
		}
	},

	accessToken: process.env.ACCESS_TOKEN,

	logentries: {
		token: process.env.LOGENTRIES_TOKEN
	},

	hook: {
		url: process.env.HOOK_URL,
		token: process.env.HOOK_TOKEN
	},

	transport: {
		mandrill: {
			token: process.env.MANDRILL_TOKEN,
			from: {
				email: process.env.MANDRILL_FROM_EMAIL,
				name: process.env.MANDRILL_FROM_NAME
			}
		},
		twilio : {
			accountSid: process.env.TWILIO_ACCOUNT_SID,
			authToken: process.env.TWILIO_ACCOUNT_TOKEN
		},
		gcm : {
			serverApiKey: process.env.GOOGLE_SERVER_API_KEY
		},
		apn : {
			cert: process.env.APPLE_CERT,
			key: process.env.APPLE_KEY
		}
	},

	jobs: {
		run: {
			resolve: 5,
			execute: 10
		},

		collection: 'notifierJobs'
	}
};

module.exports = config;