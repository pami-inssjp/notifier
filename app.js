var notifier = require('./source/notifier');
var config = require('./config');

// Custom event definitions
require('./source/events/signup')(notifier);
require('./source/events/forgot-password')(notifier);
require('./source/events/reply-argument')(notifier);
require('./source/events/law-published')(notifier);

// start the server
notifier.start(config.port || 9001);