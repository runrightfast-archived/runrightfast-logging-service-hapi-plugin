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
var Hapi = require('hapi');

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

	it("can be plugged into a Hapi pack with default options", function(done) {
		var server = new Hapi.Server();

		var loggingServiceOptions = {};

		server.pack.require('../', loggingServiceOptions, function(err) {
			expect(err).to.not.exist;
			done();
		});
	});

	it("can be plugged into a Hapi pack with options", function(done) {
		var server = new Hapi.Server();

		var options = {
			loggingService : require('runrightfast-logging-service')(),
			logLevel : 'DEBUG'
		};

		options.loggingService.log({
			tags : [ 'info' ],
			data : 'loggingService.log type is : ' + (typeof options.loggingService.log)
		});

		server.pack.require('../', options, function(err) {
			expect(err).to.not.exist;
			done();
		});
	});

	it("can be plugged into a Hapi pack with options containing a loggingServiceFactory", function(done) {
		var server = new Hapi.Server();

		var options = {
			loggingServiceFactory : function() {
				return require('runrightfast-logging-service')();
			},
			logLevel : 'DEBUG'
		};

		options.loggingServiceFactory().log({
			tags : [ 'info' ],
			data : 'loggingServiceFactory type is : ' + (typeof options.loggingServiceFactory)
		});

		server.pack.require('../', options, function(err) {
			expect(err).to.not.exist;
			done();
		});
	});

	it("requires a valid LoggingService implementation", function(done) {
		var server = new Hapi.Server();

		var options = {
			loggingServiceFactory : function() {
				return {};
			},
			logLevel : 'DEBUG'
		};

		try {
			server.pack.require('../', options, function(err) {
				console.log('server.pack.require error: ' + error);
				expect(err).to.exist;
			});
			done(new Error('Expected plugin to fail to load with an Error'));
		} catch (error) {
			console.log(error);
			done();
		}
	});

	it("can be plugged into a Hapi pack with options into a specific server selected by label ", function(done) {
		var server = new Hapi.Server({
			labels : [ 'web' ]
		});

		var options = {
			loggingService : require('runrightfast-logging-service')(),
			serverLabels : [ 'web' ]
		};

		options.loggingService.log({
			tags : [ 'info' ],
			data : 'loggingService.log type is : ' + (typeof options.loggingService.log)
		});

		options.loggingService.log({
			tags : [ 'info' ],
			data : 'options.serverLabels is : ' + JSON.stringify(options.serverLabels)
		});

		server.pack.require('../', options, function(err) {
			expect(err).to.not.exist;
			done();
		});
	});

	describe("registers a REST API at /api/runrightfast-logging-service/log by default", function() {
		it("- a single event can be POSTed", function(done) {
			var server = new Hapi.Server();

			var loggingServiceOptions = {};

			server.pack.require('../', loggingServiceOptions, function(err) {
				expect(err).to.not.exist;

				var event = {
					tags : [ 'info' ],
					data : 'test message'
				};

				server.inject({
					method : 'POST',
					url : '/api/runrightfast-logging-service/log',
					payload : JSON.stringify(event),
					headers : {
						'Content-Type' : 'application/json'
					}
				}, function(res) {
					expect(res.statusCode).to.equal(202);
					done();
				});
			});
		});

		it("- a single event with event.ts specified can be POSTed", function(done) {
			var server = new Hapi.Server();

			var loggingServiceOptions = {};

			server.pack.require('../', loggingServiceOptions, function(err) {
				expect(err).to.not.exist;

				var event = {
					tags : [ 'info' ],
					data : 'test message',
					ts : new Date()
				};

				server.inject({
					method : 'POST',
					url : '/api/runrightfast-logging-service/log',
					payload : JSON.stringify(event),
					headers : {
						'Content-Type' : 'application/json'
					}
				}, function(res) {
					expect(res.statusCode).to.equal(202);
					done();
				});
			});
		});

		it("- an array of events can be POSTed", function(done) {
			var server = new Hapi.Server();

			var loggingServiceOptions = {};

			server.pack.require('../', loggingServiceOptions, function(err) {
				expect(err).to.not.exist;

				var events = [ {
					tags : [ 'info' ],
					data : 'test message 1'
				}, {
					tags : [ 'info' ],
					data : 'test message 2'
				} ];

				server.inject({
					method : 'POST',
					url : '/api/runrightfast-logging-service/log',
					payload : JSON.stringify(events),
					headers : {
						'Content-Type' : 'application/json'
					}
				}, function(res) {
					expect(res.statusCode).to.equal(202);
					done();
				});
			});
		});

		it("returns an HTTP response code of 400 when a single invalid event is POSTed", function(done) {
			var server = new Hapi.Server();

			var loggingServiceOptions = {};

			server.pack.require('../', loggingServiceOptions, function(err) {
				expect(err).to.not.exist;

				var event = {
					data : 'test message'
				};

				server.inject({
					method : 'POST',
					url : '/api/runrightfast-logging-service/log',
					payload : JSON.stringify(event),
					headers : {
						'Content-Type' : 'application/json'
					}
				}, function(res) {
					expect(res.statusCode).to.equal(400);
					done();
				});
			});
		});

		it("returns an HTTP response code of 400 when an array of events is POSTed containing an invalid event "
				+ "- the number of valid events that were accepted are also returned", function(done) {
			var server = new Hapi.Server();

			var loggingServiceOptions = {};

			server.pack.require('../', loggingServiceOptions, function(err) {
				expect(err).to.not.exist;

				var events = [ {
					tags : [ 'info' ],
					data : 'test message 1'
				}, {
					tags : [ 'info' ],
					data : 'test message 2'
				}, {
					data : 'invalid message'
				}, {
					tags : [ 'info' ],
					data : 'test message 3'
				} ];

				server.inject({
					method : 'POST',
					url : '/api/runrightfast-logging-service/log',
					payload : JSON.stringify(events),
					headers : {
						'Content-Type' : 'application/json'
					}
				}, function(res) {
					expect(res.statusCode).to.equal(400);
					var responseObject = JSON.parse(res.payload);
					expect(responseObject.validCount).to.equal(2);
					done();
				});
			});
		});
	});

});