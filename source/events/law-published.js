var config = require('../../config');
var db = require('../db')(config.db);
var transport = require('../transport');
var logger = require('../utils/logger');
var templates = require('../templates');
var t = require('../translations').t;
var ObjectId = require('mongojs').ObjectId;

module.exports = function (notifier) {
  if (!notifier || typeof notifier != 'object') throw new Error('Unable to initialize singup event - Undefined notifier');

  // Receiver
  notifier
    .receive('law-published', function (event, actions, callback) {
      logger.info('Received event ' + JSON.stringify(event));

      var tag = event.law.tag;
      db.user.find({ tags: { $in: [ObjectId(tag.id)] } }, function (err, users) {
        if (err) return callback(err);

        users.forEach(function (user) {
          if (user.notifications['new-topic']) {
            actions.create('law-published', { law: event.law, url: event.url, user: user }, function (err) {
              logger.info({message: 'Created "law-published" action for law ' + event.law.id });
              callback && callback(err);
            });
          } else {
            callback && callback(err);
          }
        });
      })

    })

  // Resolver
    .resolve('law-published', function (action, actions, callback) {
      logger.info('Resolving action ' + JSON.stringify(action));
      var data = {
        url: action.url,
        law: action.law,
        user: action.user
      };

      logger.info('Received action ' + JSON.stringify(action) + ' with data ' + JSON.stringify(data));
      actions.resolved(action, data, callback);
    })

    // Executor
    .execute('law-published', function (action, transport, callback) {
        var law = action.data.law;
        var url = action.data.url;
        var user = action.data.user;

        var vars = [
          {name: 'LAW', content: law.title},
          {name: 'URL', content: url},
          {name: 'USER_NAME', content: formatName(user)}
        ];

        templates.jade('law-published', vars, function (err, content) {
          logger.info('Notifying user ' + user.email);

          transport.mandrill('/messages/send', {
            message: {
              auto_html: null,
              to: [{email: user.email}],
              preserve_recipients: false,
              from_email: config.transport.mandrill.from.email,
              from_name: config.transport.mandrill.from.name,
              subject: t('templates.law-published.subject'),
              text: content,
              html: content,
              auto_text: true
            }
          }, function (err) {
            callback && callback(err);
          });
        });
    });
}



function formatName (user) {
  return user.lastName ? user.firstName + ' ' + user.lastName : user.firstName;
}