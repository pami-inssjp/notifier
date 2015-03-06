var config = require('../../config');
var db = require('../db')(config.db);
var logger = require('../utils/logger');
var ObjectId = require('mongojs').ObjectId;

module.exports = function (notifier) {
  if (!notifier || typeof notifier != 'object') throw new Error('Unable to initialize lished event - Undefined notifier');

  // Receiver
  notifier
    .receive('law-commented', function (event, actions, callback) {
      logger.info('Received event ' + JSON.stringify(event));

      actions.create('law-commented',
        {
          type: 'law-commented',
          law: event.law,
          user: event.user,
          comment: event.comment,
          instance: event.instance
        },
        function (err) {
          logger.info({message: 'Created "law-commented" action for law ' + event.law + ' in ' + event.instance });
          if (callback) callback(err);
        }
      );
    })

  // Resolver
    .resolve('law-commented', function (action, actions, callback) {
      logger.info('Resolving action ' + JSON.stringify(action));

      var feed = {
        type: action.type,
        url: action.instance,
        data: {
                law: action.law,
                user: action.user,
                comment: action.comment
              }
      }

      actions.resolved(action, feed, callback);
    })

    // Executor
    .execute('law-commented', function (action, transport, callback) {
      db.feeds.findOne({ url: action.instance }, function (err, feed) {
        if (err) return logger.err('Error found %s', err), callback(err);

        feed = feed || {};
        feed.type = action.type;
        feed.url = action.instance;
        feed.data = {
                      law: action.law,
                      user: action.user,
                      comment: action.comment
                    };

        db.feeds.save(feed, function (err, feed) {
          if (err) return logger.err('Error found %s', err), callback(err);

          logger.info('Saved feed for commented law %s', action.data.law);
          if (callback) callback(null, feed);
        });
      });
    });
}
