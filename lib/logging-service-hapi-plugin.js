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
 *               logRoutePath : '/log', // OPTIONAL - defaults to '/log'
 *               serverLabels : ['web'] // OPTIONAL - used to select which servers in the pack to add the routes to - default is all servers in the pack
 *            }
 * 			  </code>
 */
module.exports.register = function(plugin, options, next) {
	'use strict';

	var handlers = require('./handlers');
	var lodash = require('lodash');
	var Hoek = require('hoek');
	var assert = Hoek.assert;

	var defaultConfig = {
		logRoutePath : '/log',
		async : true
	};

	var settings = Hoek.applyToDefaults(defaultConfig, options);
	if (lodash.isObject(settings.loggingService)) {
		assert(lodash.isFunction(settings.loggingService.log), "loggingService must contain a function named log");
		assert(lodash.isFunction(settings.loggingService.validateEvent), "loggingService must contain a function named validateEvent");
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
			handler : handlers(settings),
			description : 'logs an event object or an array of events',
			tags : [ 'log' ]
		}
	});

	next();

};