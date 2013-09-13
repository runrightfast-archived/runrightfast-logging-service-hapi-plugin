'use strict';

var expect = require('chai').expect;
var assert = require('chai').assert;

var handlers = require('../lib/handlers');

var createRequest = function() {
	return {
		payload : {},
		reply : function(x) {
			this.response = {
				code : function(code) {
					this.returnCode = code;
				}
			};
			this.response.payload = x;
			return this.response;
		}
	};
};

describe('handlers module', function() {

	describe('exports a logHandler function', function() {
		it('its settings requires a loggingService property to be defined', function() {
			try {
				handlers.logHandler({});
			} catch (error) {
				// expected to fail
				console.log(error.message);
				return;
			}
			assert.fail('no error', 'error', 'Expected an error to be thrown');

		});

		it('that can log a single event', function() {
			var loggingService = require('runrightfast-logging-service')();
			var settings = {
				loggingService : loggingService
			};
			var logHandler = require('../lib/handlers').logHandler(settings);

			var request = createRequest();

			var event = {
				tags : [ 'info' ],
				data : 'test message'
			};

			request.payload = event;

			logHandler(request);

			expect(request.response.payload).to.be.undefined;
			expect(request.response.returnCode).to.equal(202);

		});

		it('that returns a 400 response code and error response payload for an invalid event', function() {
			var loggingService = require('runrightfast-logging-service')();
			var settings = {
				loggingService : loggingService
			};
			var logHandler = require('../lib/handlers').logHandler(settings);

			var request = createRequest();

			var event = {
				data : 'test message'
			};

			request.payload = event;

			logHandler(request);

			expect(request.response.payload).to.exist;
			console.log(request.response.payload);
			expect(request.response.returnCode).to.equal(400);

		});

		it('that returns a 400 response code and error response payload when the first invalid event is encountered', function() {
			var loggingService = require('runrightfast-logging-service')();
			var settings = {
				loggingService : loggingService
			};
			var logHandler = require('../lib/handlers').logHandler(settings);

			var request = createRequest();

			var events = [ {
				tags : [ 'info' ],
				data : 'test message 1'
			}, {
				data : 'test message 2'
			}, {
				tags : [ 'info' ],
				data : 'test message 3'
			} ];

			request.payload = events;

			logHandler(request);

			expect(request.response.payload).to.exist;
			console.log(request.response.payload);
			expect(request.response.returnCode).to.equal(400);

		});

		it('that can log an array of events', function() {
			var loggingService = require('runrightfast-logging-service')();
			var settings = {
				loggingService : loggingService
			};
			var logHandler = require('../lib/handlers').logHandler(settings);

			var request = createRequest();

			var events = [ {
				tags : [ 'info' ],
				data : 'test message 1'
			}, {
				tags : [ 'info' ],
				data : 'test message 2'
			} ];

			request.payload = events;

			logHandler(request);

			expect(request.response.returnCode).to.equal(202);
			expect(loggingService.eventCount).to.equal(2);

		});

		it('that can log a single event asynchronously', function() {
			var loggingService = require('runrightfast-logging-service')();
			var settings = {
				loggingService : loggingService,
				async : true
			};
			var logHandler = require('../lib/handlers').logHandler(settings);

			var request = createRequest();

			var event = {
				tags : [ 'info' ],
				data : 'test message async'
			};

			request.payload = event;

			logHandler(request);

			expect(request.response.returnCode).to.equal(202);
			expect(loggingService.eventCount).to.equal(0);

		});

		it('that can log an array of events asynchronously', function() {
			var loggingService = require('runrightfast-logging-service')();
			var settings = {
				loggingService : loggingService,
				async : true
			};
			var logHandler = require('../lib/handlers').logHandler(settings);

			var request = createRequest();

			var events = [ {
				tags : [ 'info' ],
				data : 'test message async 1'
			}, {
				tags : [ 'info' ],
				data : 'test message async 2'
			} ];

			request.payload = events;

			logHandler(request);

			expect(request.response.returnCode).to.equal(202);
			expect(loggingService.eventCount).to.equal(0);

		});

	});

});