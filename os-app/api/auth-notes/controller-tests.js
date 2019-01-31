/*!
 * wikiavec
 * Copyright(c) 2018 Rosano Coutinho
 * MIT Licensed
 */

const assert = require('assert');

var testingLibrary = require('OLSKTesting');

var metalLibrary = require('./metal.js');
var controllerModule = require('./controller');
const versionsMetal = require('../auth-versions/metal.js');

describe('OLSKControllerRoutes', function testOLSKControllerRoutes() {

	it('returns route objects', function() {
		assert.deepEqual(controllerModule.OLSKControllerRoutes(), {
			WKCRouteAPINotesCreate: {
				OLSKRoutePath: '/api/notes',
				OLSKRouteMethod: 'post',
				OLSKRouteFunction: controllerModule.WKCAPINotesCreateAction,
				OLSKRouteMiddlewares: [
					'WKCSharedMiddlewareAPIAuthenticate',
				],
			},
			WKCRouteAPINotesPublicRead: {
				OLSKRoutePath: '/api/notes/:wkc_note_public_id(\\d+)',
				OLSKRouteMethod: 'get',
				OLSKRouteFunction: controllerModule.WKCActionAPINotesPublicRead,
			},
			WKCRouteAPINotesUpdate: {
				OLSKRoutePath: '/api/notes/:wkc_note_id(\\d+)',
				OLSKRouteMethod: 'put',
				OLSKRouteFunction: controllerModule.WKCActionAPINotesUpdate,
				OLSKRouteMiddlewares: [
					'WKCSharedMiddlewareAPIAuthenticate',
				],
			},
			WKCRouteAPINotesPublish: {
				OLSKRoutePath: '/api/notes/:wkc_note_id(\\d+)/publish',
				OLSKRouteMethod: 'put',
				OLSKRouteFunction: controllerModule.WKCActionAPINotesPublish,
				OLSKRouteMiddlewares: [
					'WKCSharedMiddlewareAPIAuthenticate',
					'WKCSharedMiddlewareAPINotesFindByID',
				],
			},
			WKCRouteAPINotesDelete: {
				OLSKRoutePath: '/api/notes/:wkc_note_id(\\d+)',
				OLSKRouteMethod: 'delete',
				OLSKRouteFunction: controllerModule.WKCAPINotesDeleteAction,
				OLSKRouteMiddlewares: [
					'WKCSharedMiddlewareAPIAuthenticate',
				],
			},
			WKCRouteAPINotesSearch: {
				OLSKRoutePath: '/api/notes/search',
				OLSKRouteMethod: 'get',
				OLSKRouteFunction: controllerModule.WKCAPINotesSearchAction,
				OLSKRouteMiddlewares: [
					'WKCSharedMiddlewareAPIAuthenticate',
				],
			},
		});
	});

});

describe('OLSKControllerSharedMiddlewares', function testOLSKControllerSharedMiddlewares() {

	it('returns middleware functions', function() {
		assert.deepEqual(controllerModule.OLSKControllerSharedMiddlewares(), {
			WKCSharedMiddlewareAPINotesFindByID: controllerModule.WKCAPINotesMiddlewareFindByID,
		});
	});

});

var WKCFakeRequest = function(inputData = {}) {
	return Object.assign(testingLibrary.OLSKTestingFakeRequestForHeaders({
		'x-client-key': process.env.WKC_INSECURE_API_ACCESS_TOKEN,
	}), {
		OLSKSharedConnectionFor: function() {
			return {
				OLSKConnectionClient: global.WKCTestingMongoClient,
			};
		},

	}, inputData);
};

var WKCFakeResponseSync = function() {
	return {
		json: function(inputData) {
			return inputData;
		},
	};
};

var WKCFakeResponseAsync = function(callback) {
	return {
		json: function(inputData) {
			return callback(inputData);
		},
	};
};

describe('WKCAPINotesMiddlewareFindByID', function WKCAPINotesMiddlewareFindByID() {

	it('returns next(WKCAPIClientError) without wkc_note_id', function() {
		assert.deepEqual(controllerModule.WKCAPINotesMiddlewareFindByID(WKCFakeRequest({
			params: {},
		}), testingLibrary.OLSKTestingFakeResponseForJSON(), testingLibrary.OLSKTestingFakeNext()), new Error('WKCAPIClientErrorNotFound'));
	});

	it('returns next(WKCAPIClientError) with null wkc_note_id', function() {
		assert.deepEqual(controllerModule.WKCAPINotesMiddlewareFindByID(WKCFakeRequest({
			params: {
				wkc_note_id: null,
			},
		}), testingLibrary.OLSKTestingFakeResponseForJSON(), testingLibrary.OLSKTestingFakeNext()), new Error('WKCAPIClientErrorNotFound'));
	});

	it('returns next(WKCAPIClientError) with whitespace wkc_note_id', function() {
		assert.deepEqual(controllerModule.WKCAPINotesMiddlewareFindByID(WKCFakeRequest({
			params: {
				wkc_note_id: ' ',
			},
		}), testingLibrary.OLSKTestingFakeResponseForJSON(), testingLibrary.OLSKTestingFakeNext()), new Error('WKCAPIClientErrorNotFound'));
	});

	it('returns next(WKCAPIClientError) with non-existant wkc_note_id', function(done) {
		controllerModule.WKCAPINotesMiddlewareFindByID(WKCFakeRequest({
			params: {
				wkc_note_id: 'alfa',
			},
		}), testingLibrary.OLSKTestingFakeResponseForJSON(), function(inputData) {
			assert.deepEqual(inputData, new Error('WKCAPIClientErrorNotFound'));

			done();
		});
	});

	it('returns next(undefined)', function(done) {
		controllerModule.WKCAPINotesCreateAction(WKCFakeRequest({
			body: {
				WKCNoteBody: 'alpha',
			},
		}), WKCFakeResponseAsync(function(responseJSON) {
			var requestObject = WKCFakeRequest({
				params: {
					wkc_note_id: responseJSON.WKCNoteID.toString(),
				},
			});

			controllerModule.WKCAPINotesMiddlewareFindByID(requestObject, testingLibrary.OLSKTestingFakeResponseForJSON(), function(inputData) {
				assert.deepEqual(inputData, undefined);

				assert.deepEqual(requestObject._WKCAPINotesMiddlewareFindByIDResult, responseJSON);

				done();
			});
		}));
	});

});

describe('WKCAPISettingsLastGeneratedPublicIDWithClientAndCallback', function testWKCAPISettingsLastGeneratedPublicIDWithClientAndCallback() {

	it('throws error if param1 empty', function() {
		assert.throws(function() {
			controllerModule.WKCAPISettingsLastGeneratedPublicIDWithClientAndCallback(null, function() {});
		}, /WKCErrorInvalidInput/);
	});

	it('throws error if param2 not function', function() {
		assert.throws(function() {
			controllerModule.WKCAPISettingsLastGeneratedPublicIDWithClientAndCallback({}, null);
		}, /WKCErrorInvalidInput/);
	});

	it('returns 0 if no existing items', function(done) {
		controllerModule.WKCAPISettingsLastGeneratedPublicIDWithClientAndCallback(global.WKCTestingMongoClient, function(lastRepoID) {
			assert.strictEqual(lastRepoID, 0);

			done();
		});
	});

	it('returns 1 if published one item', function(done) {
		controllerModule.WKCAPINotesCreateAction(WKCFakeRequest({
			body: {
				WKCNoteBody: 'alpha',
			},
		}), WKCFakeResponseAsync(function(noteObject) {
			controllerModule.WKCActionAPINotesPublish(WKCFakeRequest({
				params: {
					wkc_note_id: noteObject.WKCNoteID,
				},
				_WKCAPINotesMiddlewareFindByIDResult: noteObject,
				body: {
					WKCNotePublishStatusIsPublished: true,
				},
			}), WKCFakeResponseAsync(function(responseJSON) {
				controllerModule.WKCAPISettingsLastGeneratedPublicIDWithClientAndCallback(global.WKCTestingMongoClient, function(lastRepoID) {
					assert.strictEqual(lastRepoID, 1);

					done();
				});
			}));
		}));
	});

	it('returns 2 if published two items and deleted first one', function(done) {
		controllerModule.WKCAPINotesCreateAction(WKCFakeRequest({
			body: {
				WKCNoteBody: 'alpha',
			},
		}), WKCFakeResponseAsync(function(noteObject) {
			controllerModule.WKCActionAPINotesPublish(WKCFakeRequest({
				params: {
					wkc_note_id: noteObject.WKCNoteID,
				},
				_WKCAPINotesMiddlewareFindByIDResult: noteObject,
				body: {
					WKCNotePublishStatusIsPublished: true,
				},
			}), WKCFakeResponseAsync(function(responseJSON) {
				controllerModule.WKCAPINotesDeleteAction(WKCFakeRequest({
					params: {
						wkc_note_id: noteObject.WKCNoteID.toString(),
					},
				}), WKCFakeResponseAsync(function() {
					controllerModule.WKCAPINotesCreateAction(WKCFakeRequest({
						body: {
							WKCNoteBody: 'alpha',
						},
					}), WKCFakeResponseAsync(function(noteObject) {
						controllerModule.WKCActionAPINotesPublish(WKCFakeRequest({
							params: {
								wkc_note_id: noteObject.WKCNoteID,
							},
							_WKCAPINotesMiddlewareFindByIDResult: noteObject,
							body: {
								WKCNotePublishStatusIsPublished: true,
							},
						}), WKCFakeResponseAsync(function(responseJSON) {
							controllerModule.WKCAPISettingsLastGeneratedPublicIDWithClientAndCallback(global.WKCTestingMongoClient, function(lastRepoID) {
								assert.strictEqual(lastRepoID, 2);

								done();
							});
						}));
					}));
				}));
			}));
		}));
	});

});

describe('WKCActionAPINotesUpdate', function testWKCActionAPINotesUpdate() {

	it('returns next(WKCAPIClientError) if wkc_note_id does not exist', function(done) {
		controllerModule.WKCActionAPINotesUpdate(WKCFakeRequest({
			params: {
				wkc_note_id: 'alpha',
			},
			body: {
				WKCNoteBody: 'bravo',
			},
		}), WKCFakeResponseSync(), function(inputData) {
			assert.deepEqual(inputData, new Error('WKCAPIClientErrorNotFound'));

			done();
		});
	});

	it('returns WKCErrors if not valid noteObject', function(done) {
		controllerModule.WKCAPINotesCreateAction(WKCFakeRequest({
			params: {
				wkc_note_id: '',
			},
			body: {
				WKCNoteBody: 'alpha',
			},
		}), WKCFakeResponseAsync(function(responseJSON) {
			assert.deepEqual(controllerModule.WKCActionAPINotesUpdate(WKCFakeRequest({
				params: {
					wkc_note_id: responseJSON.WKCNoteID,
				},
				body: Object.assign(responseJSON, {
					WKCNoteBody: null,
				}),
			}), WKCFakeResponseSync()).WKCErrors, {
				WKCNoteBody: [
					'WKCErrorNotString',
				],
			});

			done();
		}));
	});

	it('returns noteObject with updated properties', function(done) {
		controllerModule.WKCAPINotesCreateAction(WKCFakeRequest({
			body: {
				WKCNoteBody: 'alpha',
			},
		}), WKCFakeResponseAsync(function(responseJSON) {
			var originalDateUpdated = responseJSON.WKCNoteDateUpdated;

			controllerModule.WKCActionAPINotesUpdate(WKCFakeRequest({
				params: {
					wkc_note_id: responseJSON.WKCNoteID,
				},
				body: Object.assign(responseJSON, {
					WKCNoteBody: 'bravo',
				}),
			}), WKCFakeResponseAsync(function(responseJSON) {
				assert.strictEqual(responseJSON.WKCNoteBody, 'bravo');
				assert.strictEqual(responseJSON.WKCNoteDateUpdated > originalDateUpdated, true);

				done();
			}));
		}));
	});

	it('returns noteObject with updated properties', function(done) {
		controllerModule.WKCAPINotesCreateAction(WKCFakeRequest({
			body: {
				WKCNoteBody: 'alpha',
			},
		}), WKCFakeResponseAsync(function(responseJSON) {
			var originalDateUpdated = responseJSON.WKCNoteDateUpdated;

			controllerModule.WKCActionAPINotesUpdate(WKCFakeRequest({
				params: {
					wkc_note_id: responseJSON.WKCNoteID,
				},
				body: Object.assign(responseJSON, {
					WKCNoteBody: 'bravo',
				}),
			}), WKCFakeResponseAsync(function(responseJSON) {
				assert.strictEqual(responseJSON.WKCNoteBody, 'bravo');
				assert.strictEqual(responseJSON.WKCNoteDateUpdated > originalDateUpdated, true);

				versionsMetal.WKCVersionsMetalSearch(WKCTestingMongoClient, {}).then(function (result) {
					// console.log(result);
					// assert.deepEqual(result, [{
					// 	WKCVersionNoteID: responseJSON.WKCNoteID,
					// 	WKCVersionBody: responseJSON.WKCNoteBody,
					// 	WKCVersionDate: responseJSON.WKCNoteDateUpdated,
					// 	WKCVersionID: result.WKCVersionID,
					// }]);
					done();
				});
			}));
		}));
	});

});

describe('WKCActionAPINotesPublish', function testWKCActionAPINotesPublish() {

	it('returns WKCErrors if not valid WKCNotePublishStatus', function(done) {
		controllerModule.WKCAPINotesCreateAction(WKCFakeRequest({
			params: {
				wkc_note_id: '',
			},
			body: {
				WKCNotePublishStatusIsPublished: null,
			},
		}), WKCFakeResponseAsync(function(noteObject) {
			assert.deepEqual(controllerModule.WKCActionAPINotesPublish(WKCFakeRequest({
				params: {
					wkc_note_id: noteObject.WKCNoteID,
				},
				_WKCAPINotesMiddlewareFindByIDResult: noteObject,
				body: {
					WKCNotePublishStatusIsPublished: null,
				},
			}), WKCFakeResponseSync()).WKCErrors, {
				WKCNotePublishStatusIsPublished: [
					'WKCErrorNotBoolean',
				],
			});

			done();
		}));
	});

	it('returns noteObject with updated properties', function(done) {
		controllerModule.WKCAPINotesCreateAction(WKCFakeRequest({
			body: {
				WKCNoteBody: 'alpha',
			},
		}), WKCFakeResponseAsync(function(noteObject) {
			var originalDateUpdated = noteObject.WKCNoteDateUpdated;

			assert.strictEqual(noteObject.WKCNotePublishStatusIsPublished, undefined);
			assert.strictEqual(noteObject.WKCNotePublicID, undefined);

			controllerModule.WKCActionAPINotesPublish(WKCFakeRequest({
				params: {
					wkc_note_id: noteObject.WKCNoteID,
				},
				_WKCAPINotesMiddlewareFindByIDResult: noteObject,
				body: {
					WKCNotePublishStatusIsPublished: true,
				},
			}), WKCFakeResponseAsync(function(responseJSON) {
				assert.deepEqual(responseJSON, {
					WKCNotePublishStatusIsPublished: true,
				});

				metalLibrary.WKCNotesMetalRead(WKCTestingMongoClient, noteObject.WKCNoteID.toString()).then(function(noteObject) {
					assert.strictEqual(noteObject.WKCNotePublishStatusIsPublished, true);
					assert.strictEqual(noteObject.WKCNotePublicID, 1);
					assert.strictEqual(noteObject.WKCNoteDateUpdated > originalDateUpdated, true);

					done();
				});
			}));
		}));
	});

});

describe('WKCActionAPINotesPublicRead', function testWKCActionAPINotesPublicRead() {

	it('returns next(WKCAPIClientError) if wkc_note_id does not exist', function(done) {
		controllerModule.WKCActionAPINotesPublicRead(WKCFakeRequest({
			params: {
				wkc_note_public_id: 'alpha',
			},
		}), WKCFakeResponseAsync(), function(inputData) {
			assert.deepEqual(inputData, new Error('WKCAPIClientErrorNotFound'));

			done();
		});
	});

	it('returns noteObject', function(done) {
		controllerModule.WKCAPINotesCreateAction(WKCFakeRequest({
			body: {
				WKCNoteBody: 'alpha\nbravo',
			},
		}), WKCFakeResponseAsync(function(noteObject) {
			controllerModule.WKCActionAPINotesPublish(WKCFakeRequest({
				params: {
					wkc_note_id: noteObject.WKCNoteID,
				},
				_WKCAPINotesMiddlewareFindByIDResult: noteObject,
				body: {
					WKCNotePublishStatusIsPublished: true,
				},
			}), WKCFakeResponseAsync(function(responseJSON) {
				controllerModule.WKCActionAPINotesPublicRead(WKCFakeRequest({
					params: {
						wkc_note_public_id: noteObject.WKCNotePublicID,
					},
				}), WKCFakeResponseAsync(function(noteObjectPublic) {
					assert.deepEqual(noteObjectPublic, {
						WKCNotePublicID: 1,
						WKCNoteBody: noteObject.WKCNoteBody,
						WKCNoteDateCreated: noteObject.WKCNoteDateCreated,
						WKCNoteDateUpdated: noteObject.WKCNoteDateUpdated,
						WKCNoteDetectedTitle: 'alpha',
						WKCNoteDetectedBody: 'bravo',
					});

					done();
				}));
			}));
		}));
	});

});
