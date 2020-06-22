const kDefaultRoute = require('./controller.js').OLSKControllerRoutes().shift();

const kTesting = {
	uSerial (inputData) {
		return inputData.reduce(function (coll, e) {
			return coll.then(e);
		}, Promise.resolve());
	},
	uLaunch (inputData) {
		return kTesting.uSerial([
			function () {
				return browser.pressButton('.OLSKAppToolbarLauncherButton');
			},
			function () {
				return browser.fill('.LCHLauncherFilterInput', inputData);
			},
			function () {
				return browser.click('.LCHLauncherResultListItem');
			},
		]);
	},
};

describe('KVCWrite_Sync', function () {	

	before(function() {
		return browser.OLSKVisit(kDefaultRoute);
	});

	before(function () {
		return browser.pressButton('.KVCWriteMasterCreateButton');
	});

	before(function () {
		browser.fill('.KVCWriteInputFieldDebug', 'alfa');
	});

	before(function () {
		return browser.OLSKFireKeyboardEvent(browser.window, 'Escape');
	});

	describe('OLSKChangeDelegateCreateNote', function test_OLSKChangeDelegateCreateNote () {

		before(function () {
			browser.assert.elements('.OLSKResultsListItem', 1);
		});

		before(function () {
			return kTesting.uLaunch('FakeOLSKChangeDelegateCreateNote');
		});

		it('adds note', function () {
			browser.assert.elements('.OLSKResultsListItem', 2);
		});

		it('sorts list', function () {
			browser.assert.text('.OLSKResultsListItem', 'FakeOLSKChangeDelegateCreateNote alfa');
		});

		context('selected', function () {
			
			before(function () {
				return browser.click('.OLSKResultsListItem:nth-child(2)');
			});

			before(function () {
				browser.fill('.KVCWriteInputFieldDebug', 'alfa2');
			});

			before(function () {
				return kTesting.uLaunch('FakeOLSKChangeDelegateCreateNote');
			});

			it('adds note', function () {
				browser.assert.elements('.OLSKResultsListItem', 3);
			});

			it('skips sort', function () {
				browser.assert.text('.OLSKResultsListItem', 'FakeOLSKChangeDelegateCreateNote FakeOLSKChangeDelegateCreateNote alfa2');
			});
		
		});

	});

});
