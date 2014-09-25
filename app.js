var notifier = require('./source/notifier');

// Custom event definitions
require('./source/events/signup')(notifier);
require('./source/events/forgot-password')(notifier);

// start the server
notifier.start(9001);