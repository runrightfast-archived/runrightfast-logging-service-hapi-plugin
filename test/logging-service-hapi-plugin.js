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
'use strict';

var expect = require('chai').expect;

describe("LoggingService Hapi Plugin", function() {

	it("can load the runrightfast-logging-service module", function() {
		var loggingService = require('runrightfast-logging-service')();
		var event = {
			tags : [ 'info' ],
			data : 'LoggingService can log events to console when no options are specified'
		};
		var i = 0;
		
		loggingService.log(event);
		expect(loggingService.invalidEventCount).to.equal(0);

		for (i = 0; i < 10; i++) {
			loggingService.log({
				tags : [ 'info' ],
				data : {
					i : i
				}
			});
		}

		expect(loggingService.invalidEventCount).to.equal(0);
		expect(loggingService.eventCount).to.gt(0);
	});
});