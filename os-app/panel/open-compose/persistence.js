import * as WKCStorageClient from '../_shared/WKCStorageClient/main.js';
import * as RSModuleProtocol_wkc_notes from '../_shared/rs-modules/wkc_notes/rs-module.js';
import * as WKCWriteLogic from '../open-write/ui-logic.js';

import * as WKCNotesAction from '../_shared/rs-modules/wkc_notes/action.js';

import { writable } from 'svelte/store';

export const notesAll = writable([]);
export const noteSelected = writable(null);

let _noteSelected;
noteSelected.subscribe(function (val) {
	_noteSelected = val;
});
export const storageClient = WKCStorageClient.WKCStorageClientForModules([
	RSModuleProtocol_wkc_notes.RSModuleProtocolModuleForChangeDelegate({
		OLSKChangeDelegateAdd: function (inputData) {
			// console.log('OLSKChangeDelegateAdd', inputData);
			notesAll.update(function (val) {
				return val.filter(function (e) { // @Hotfix Dropbox sending DelegateAdd
					return e.WKCNoteID !== inputData.WKCNoteID;
				}).concat(inputData).sort(WKCWriteLogic.default.WKCWriteLogicSort);
			});

			modelDidChange.set(Date.now());
		},
		OLSKChangeDelegateRemove: function (inputData) {
			// console.log('OLSKChangeDelegateRemove', inputData);

			if (_noteSelected && (_noteSelected.WKCNoteID === inputData.WKCNoteID)) {
				noteSelected.set(null);
			}

			notesAll.update(function (val) {
				return val.filter(function (e) {
					return e.WKCNoteID !== inputData.WKCNoteID;
				});
			});

			modelDidChange.set(Date.now());
		},
		OLSKChangeDelegateUpdate: function (inputData) {
			// console.log('OLSKChangeDelegateUpdate', inputData);
			if (_noteSelected && (_noteSelected.WKCNoteID === inputData.WKCNoteID)) {
				noteSelected.update(function (val) {
					return Object.assign(val, inputData);
				});
			}

			notesAll.update(function (val) {
				return val.map(function (e) {
					return Object.assign(e, e.WKCNoteID === inputData.WKCNoteID ? inputData : {});
				});
			});

			modelDidChange.set(Date.now());
		},
	}),
]);

let remoteStorage = storageClient.remoteStorage;

remoteStorage.on('ready', async () => {
	console.debug('ready', arguments);

	await remoteStorage.wkc_notes.init();

	// setupFinalize(); remove loading class
});

(function SetupStorageClientLogging() {
	remoteStorage.on('not-connected', () => {
		console.debug('not-connected', arguments);
	});

	remoteStorage.on('disconnected', () => {
		console.debug('disconnected', arguments);
	});

	remoteStorage.on('connected', () => {
		console.debug('connected', arguments);
	});

	remoteStorage.on('error', (error) => {
		console.debug('error', error);

		document.querySelector('#WIKComposeStorageWidget').classList.add('remotestorage-widget-error-state');
	});

	remoteStorage.on('network-offline', () => {
		console.debug('network-offline', arguments);
	});

	remoteStorage.on('network-online', () => {
		console.debug('network-online', arguments);
	});

	remoteStorage.on('sync-done', () => {
		console.debug('sync-done', arguments);
	});
})();