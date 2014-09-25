var config = require('../../config');
var db = require('../db')(config.db);
var transport = require('../transport');
var logger = require('../utils/logger');
var templates = require('../templates');
var t = require('../translations').t;

module.exports = function signup(notifier) {
  if (!notifier || typeof notifier != 'object') throw new Error('Unable to initialize singup event - Undefined notifier');

  function receive(event, actions, callback) {
    logger.info('Received event ' + JSON.stringify(event));

    actions.create('send-welcome', { user: event.user, validateUrl: event.validateUrl }, function (err) {
      logger.info({message: 'Created "send-welcome" action for user ' + event.user });
      callback && callback(err);
    });

  }

  // Receiver
  notifier
    .receive('signup', receive)
    .receive('resend-validation', receive)

  // Resolver
  notifier.resolve('send-welcome', function (action, actions, callback) {
    logger.info('Resolving action ' + JSON.stringify(action));
    db.user.findOne({ email: action.user }, function (err, user) {
      if (err) return callback(err);
      if (!user) return callback({message: 'user not found', email: action.email});

      var data = {
        email: user.email,
        user: { name: formatName(user) },
        validateUrl: action.validateUrl
      }

      logger.info('Received action ' + JSON.stringify(action) + ' with data ' + JSON.stringify(data));
      actions.resolved(action, data, callback);
    });
  })

  // Executor
  .execute('send-welcome', function (action, transport, callback) {
      var vars = [
        {name: 'USER_NAME', content: action.data.user.name},
        {name: 'VALIDATE_MAIL_URL', content: action.data.validateUrl}
      ];

      // Add get content from jade template
      templates.jade('welcome-email', vars, function (err, content) {

        transport.mandrill('/messages/send', {
            message: {
              auto_html: null,
              to: [{email: action.data.email}],
              preserve_recipients: false,
              from_email: config.transport.mandrill.from.email,
              from_name: config.transport.mandrill.from.name,
              subject: t('templates.welcome-email.subject'),
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
  return user.lastName ? user.firstName + ' ' + user.lastName : user.firstName
}