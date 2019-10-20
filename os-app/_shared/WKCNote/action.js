import * as WKCNoteMetal from './metal.js';
import * as WKCNoteModel from './model.js';
import * as WKCSettingAction from '../WKCSetting/action.js';
import * as WKCVersionAction from '../WKCVersion/action.js';
import * as WKCParser from '../WKCParser/main.js';
import { factory, detectPrng } from 'ulid';
const uniqueID = typeof require === 'undefined' && navigator.appName === 'Zombie' ? factory(detectPrng(true)) : factory();

export const WKCNoteActionCreate = async function(storageClient, inputData) {
	if (typeof inputData !== 'object' || inputData === null) {
		return Promise.reject(new Error('WKCErrorInputNotValid'));
	}

	let creationDate = new Date();

	return await WKCNoteMetal.WKCNoteMetalWrite(storageClient, Object.assign(inputData, {
		WKCNoteID: uniqueID(),
		WKCNoteCreationDate: creationDate,
		WKCNoteModificationDate: creationDate,
	}));
};

export const WKCNoteActionRead = async function(storageClient, inputData) {
	return await WKCNoteMetal.WKCNoteMetalRead(storageClient, inputData);
};

export const WKCNoteActionUpdate = async function(storageClient, inputData) {
	if (typeof inputData !== 'object' || inputData === null) {
		return Promise.reject(new Error('WKCErrorInputNotValid'));
	}

	return await WKCNoteMetal.WKCNoteMetalWrite(storageClient, Object.assign(inputData, {
		WKCNoteModificationDate: new Date(),
	}));
};

export const WKCNoteActionDelete = async function(storageClient, inputData) {
	await Promise.all((await WKCVersionAction.WKCVersionActionQuery(storageClient, {
		WKCVersionNoteID: inputData,
	})).map(function (e) {
		return WKCVersionAction.WKCVersionActionDelete(storageClient, e.WKCVersionID);
	}));
	
	return await WKCNoteMetal.WKCNoteMetalDelete(storageClient, inputData);
};

export const WKCNoteActionQuery = async function(storageClient, inputData) {
	if (typeof inputData !== 'object' || inputData === null) {
		return Promise.reject(new Error('WKCErrorInputNotValid'));
	}

	return Promise.resolve(Object.values(await WKCNoteMetal.WKCNoteMetalList(storageClient)).sort(function (a, b) {
		return b.WKCNoteModificationDate - a.WKCNoteModificationDate;
	}).filter(function(e) {
		if (!Object.keys(inputData).length) {
			return true;
		}

		if (Object.entries(inputData).map(function ([key, value]) {
			return value === e[key];
		}).filter(function (e) {
			return !e;
		}).length) {
			return false;
		}

		return true;
	}));
};

export const WKCNoteActionPublish = async function(storageClient, inputData) {
	if (typeof inputData !== 'object' || inputData === null) {
		return Promise.reject(new Error('WKCErrorInputNotValid'));
	}

	if (!inputData.WKCNotePublicID) {
		inputData.WKCNotePublicID = (parseInt((await WKCSettingAction.WKCSettingsActionProperty(storageClient, 'WKCSettingsLastRepoID')) || 0) + 1).toString();

		await WKCSettingAction.WKCSettingsActionProperty(storageClient, 'WKCSettingsLastRepoID', inputData.WKCNotePublicID);
	}

	return await WKCNoteActionUpdate(storageClient, Object.assign(inputData, {
		WKCNotePublishStatusIsPublished: true,
	}));
};

export const WKCNoteActionUnpublish = async function(storageClient, inputData) {
	if (typeof inputData !== 'object' || inputData === null) {
		return Promise.reject(new Error('WKCErrorInputNotValid'));
	}

	return await WKCNoteActionUpdate(storageClient, Object.assign(inputData, {
		WKCNotePublishStatusIsPublished: false,
	}));
};

export const WKCNoteActionGetPublicLinks = async function(storageClient) {
	return Promise.resolve((await WKCNoteActionQuery(storageClient, {
		WKCNotePublishStatusIsPublished: true,
	})).map(WKCNoteModel.WKCNoteModelPostJSONParse).map(function (e) {
		return [WKCParser.WKCParserTitleForPlaintext(e.WKCNoteBody), e.WKCNotePublicID];
	}).reduce(function (coll, [key, val]) {
		if (typeof coll[key] === 'undefined') {
			coll[key] = val;
		}

		return coll;
	}, {}));
};