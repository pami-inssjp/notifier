var notifier = require('./source/notifier');
var config = require('./config');
var db = require('./source/db')(config.db);
var transport = require('./source/transport');
var logger = require('./source/utils/logger');
var templates = require('./source/templates');
var t = require('./source/translations').t;

function formatName (user) {
  return user.lastName ? user.firstName + ' ' + user.lastName : user.firstName
}

// initialize actions, resolvers and executors
notifier
    .receive('signup', function (event, actions, callback) {
      logger.info('Received event ' + JSON.stringify(event));

      actions.create('send-welcome', { user: event.user, validateUrl: event.validateUrl }, function (err) {
        logger.info({message: 'Created "send-welcome" action for user ' + event.user });
        callback && callback(err);
      });

    })

    .resolve('send-welcome', function (action, actions, callback) {
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

// start the server
notifier.start(9001);