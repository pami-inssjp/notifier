var config = require('../../config');
var db = require('../db')(config.db);
var logger = require('../utils/logger');
var ObjectId = require('mongojs').ObjectId;

module.exports = function (notifier) {
  if (!notifier || typeof notifier != 'object') throw new Error('Unable to initialize lished event - Undefined notifier');

  // Receiver
  notifier
    .receive('law-published', function (event, actions, callback) {
      logger.info('Received event ' + JSON.stringify(event));

      var law = event.law;

      actions.create('update-feed',
        {
          type: 'law-published',
          law: law.id,
          url: event.instance
        },
        function (err) {
          logger.info({message: 'Created "update-feed" action for law ' + law.id + ' in ' + event.instance });
          if (callback) callback(err);
        }
      );
    })

  // Resolver
    .resolve('update-feed', function (action, actions, callback) {
      logger.info('Resolving action ' + JSON.stringify(action));

      var feed = {
        data: { law: action.law },
        url: action.url,
        type: action.type
      }

      actions.resolved(action, feed, callback);
    })

    // Executor
    .execute('update-feed', function (action, transport, callback) {
      db.feeds.findOne({ url: action.url }, function (err, feed) {
        if (err) return logger.err('Error found %s', err), callback(err);

        feed = feed || {};
        feed.type = action.type;
        feed.url = action.url;
        feed.data = {
                      law: action.law,
                    };

        db.feeds.save(feed, function (err, feed) {
          if (err) return logger.err('Error found %s', err), callback(err);

          logger.info('Saved feed for published law %s', action.data.law);
          if (callback) callback(null, feed);
        });
      });
    });
}
