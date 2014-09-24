var fs = require('fs');
var path = require('path');
var jade = require('jade');
var t = require('../translations').t;
var logger = require('../utils/logger');

function compile(name, vars, callback) {
  var filePath = path.join(__dirname, './' + name + '.jade');

  logger.info('looking for mail template [' + name + '] in path: ' + filePath);

  fs.readFile(filePath, { encoding: 'utf-8' }, function (err, template) {
    if (err) return callback(err);

    var mail = jade.compile(template);
    var content = replaceVars(mail({ t: t }), vars);

    callback(null, content);
  });
};

function replaceVars(template, vars) {
  if (!vars) return template;

  var res = template;

  if (res) {
    vars.forEach(function (v) {
      res = res.replace(v.name, v.content);
    });
  }

  return res;
}


module.exports = {
  jade: compile
};