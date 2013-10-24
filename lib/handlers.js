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

module.exports.logHandler = function(settings) {
	'use strict';

	var lodash = require('lodash');
	var joi = require('joi');

	var schema = {
		loggingService : joi.types.Object({
			log : joi.types.Function().required(),
			validateEvent : joi.types.Function().required(),
			allowExtraKeys : true
		}).required().allowOtherKeys(),
		async : joi.types.Boolean(),
		allowExtraKeys : true
	};
	var error = joi.validate(settings, schema);
	if (error) {
		throw error;
	}

	var loggingService = settings.loggingService;
	var async = settings.async;

	/**
	 * validates the event, then logs it.
	 * 
	 * If the event is invalid, an Error is thrown.
	 */
	var logEvent = function(event) {
		loggingService.validateEvent(event);
		if (async) {
			setImmediate(function() {
				loggingService.log(event);
			});
		} else {
			loggingService.log(event);
		}
	};

	return function(request) {
		var events = request.payload;
		var i = 0;

		try {
			if (lodash.isArray(events)) {
				try {
					for (i = 0; i < events.length; i++) {
						logEvent(events[i]);
					}
				} catch (error) {
					error.validCount = i;
					throw error;
				}
			} else {
				logEvent(events);
			}
			request.reply().code(202);
		} catch (error) {
			var result = {};
			if (error.message) {
				result.message = error.message;
			}
			if (error.validCount) {
				result.validCount = error.validCount;
			}
			request.reply(result).code(400);
		}

	};
};
