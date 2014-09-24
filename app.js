var notifier = require('./source/notifier');

// Custom event definitions
require('./source/events/signup')(notifier);

// start the server
notifier.start(9001);