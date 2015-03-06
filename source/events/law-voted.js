var config = require('../../config');
var db = require('../db')(config.db);
var logger = require('../utils/logger');
var ObjectId = require('mongojs').ObjectId;

module.exports = function (notifier) {
  if (!notifier || typeof notifier != 'object') throw new Error('Unable to initialize lished event - Undefined notifier');

  // Receiver
  notifier
    .receive('law-voted', function (event, actions, callback) {
      logger.info('Received event ' + JSON.stringify(event));

      actions.create('law-voted',
        {
          type: 'law-voted',
          law: event.law,
          user: event.user,
          vote: event.vote,
          instance: event.instance
        },
        function (err) {
          logger.info({message: 'Created "law-voted" action for law ' + event.law + ' in ' + event.instance });
          if (callback) callback(err);
        }
      );
    })

  // Resolver
    .resolve('law-voted', function (action, actions, callback) {
      logger.info('Resolving action ' + JSON.stringify(action));

      var feed = {
        type: action.type,
        url: action.instance,
        data: {
                law: action.law,
                user: action.user,
                vote: action.vote
              }
      }

      actions.resolved(action, feed, callback);
    })

    // Executor
    .execute('law-voted', function (action, transport, callback) {
      db.feeds.findOne({ url: action.instance }, function (err, feed) {
        if (err) return logger.err('Error found %s', err), callback(err);

        feed = feed || {};
        feed.type = action.type;
        feed.url = action.instance;
        feed.data = {
                      law: action.law,
                      user: action.user,
                      vote: action.vote
                    };

        db.feeds.save(feed, function (err, feed) {
          if (err) return logger.err('Error found %s', err), callback(err);

          logger.info('Saved feed for published law %s', action.data.law);
          if (callback) callback(null, feed);
        });
      });
    });
}
