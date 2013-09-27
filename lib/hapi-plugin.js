/**
 * Copyright [2013] [runrightfast.co]
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

/**
 * @param options
 *            <code>
 *            {
 *               loggingService : {} // OPTIONAL - LoggingService object - takes precedence over loggingServiceOptions
 *               loggingServiceOptions : { // OPTIONAL - defaults provided by runrightfast-logging-service module - ignored if loggingService is defined
 *                   logListener : function(event){}, // OPTIONAL
 *                   badEventListener : function(event,error){}, // OPTIONAL
 *               },
 *               logRoutePath : '/api/runrightfast-logging-service/log', // OPTIONAL - defaults to '/log'
 *               serverLabels : ['api'], // OPTIONAL - used to select which servers in the pack to add the routes to - default is all servers in the pack,
 *               async : true // OPTIONAL - if true, then logs the event asynchronously, enabling the HTTP response to be sent back immediately - default is async = true
 *               logLevel : 'WARN' // OPTIONAL - DEBUG | INFO | WARN | ERROR - default is WARN
 *            }
 * 			  </code>
 */
module.exports.register = function(plugin, options, next) {
	'use strict';

	var logHandler = require('./handlers').logHandler;
	var lodash = require('lodash');
	var Hoek = require('hoek');
	var assert = Hoek.assert;

	var logging = require('runrightfast-commons').logging;
	var logger = logging.getLogger('runrightfast-logging-service');

	var defaultConfig = {
		logRoutePath : '/api/runrightfast-logging-service/log',
		async : true,
		logLevel : 'WARN'
	};

	var settings = Hoek.applyToDefaults(defaultConfig, options);
	// functions are not handled by Hoek.applyToDefaults - need to copy over
	// manually
	settings.loggingService = options.loggingService;
	settings.loggingServiceOptions = options.loggingServiceOptions;

	logging.setLogLevel(logger, settings.logLevel);
	if (logger.isLevelEnabled('DEBUG')) {
		logger.debug(settings);
	}

	if (lodash.isObject(settings.loggingService)) {
		assert(lodash.isFunction(settings.loggingService.log), "loggingService must contain a function named log : settings.loggingService.log type is ["
				+ (typeof settings.loggingService.log) + ']');
		assert(lodash.isFunction(settings.loggingService.validateEvent),
				"loggingService must contain a function named validateEvent : settings.loggingService.validateEvent type is ["
						+ (typeof settings.loggingService.validateEvent) + ']');
	} else {
		settings.loggingService = require('runrightfast-logging-service')(settings.loggingServiceOptions);
	}

	var selection = (function() {
		if (lodash.isArray(settings.serverLabels) || lodash.isString(settings.serverLabels)) {
			return plugin.select(settings.serverLabels);
		}
		return plugin;
	}());

	selection.route({
		method : 'POST',
		path : settings.logRoutePath,
		config : {
			handler : logHandler(settings),
			description : 'logs an event object or an array of events',
			tags : [ 'log' ]
		}
	});

	next();

};