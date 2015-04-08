var mandrill = require('node-mandrill');
var logger = require('./utils/logger');
var config = require('../config');

var setupMandrill = function () {
	if (!validConfig()) {
		var errorMsg = 'missing mandrill token, please update config.transport.mandrill section';
		logger.error(errorMsg);
		throw new Error(errorMsg);
	}

	return mandrill(config.transport.mandrill.token);

	function validConfig() {
		return config.transport.mandrill && config.transport.mandrill.token;
	}
};


var transport = {
	mandrill: setupMandrill(),
};

module.exports = transport;
