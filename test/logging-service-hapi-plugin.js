'use strict';

var expect = require('chai').expect;

describe("LoggingService Hapi Plugin", function() {

	it("can load the runrightfast-logging-service module", function() {
		var loggingService = require('runrightfast-logging-service')();
		var event = {
			tags : [ 'info' ],
			data : 'LoggingService can log events to console when no options are specified'
		};
		loggingService.log(event);
		expect(loggingService.invalidEventCount).to.equal(0);

		for ( var i = 0; i < 10; i++) {
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