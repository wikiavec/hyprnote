/*!
 * wikiavec
 * Copyright(c) 2018 Rosano Coutinho
 * MIT Licensed
 */

var sharedController = require('../../_shared/controller');

//_ OLSKControllerRoutes

exports.OLSKControllerRoutes = function() {
	return {
		WKCRouteLogin: {
			OLSKRoutePath: '/login',
			OLSKRouteMethod: 'get',
			OLSKRouteFunction: exports.WKCActionLoginIndex,
			OLSKRouteLanguages: ['en'],
			OLSKRouteMiddlewares: [
				'WKCSharedMiddlewareEnsureDatabase',
			],
		},
		WKCRouteLoginSubmit: {
			OLSKRoutePath: '/login',
			OLSKRouteMethod: 'post',
			OLSKRouteFunction: exports.WKCActionLoginSubmit,
			OLSKRouteLanguages: ['en'],
		},
		WKCRouteLoginDestroy: {
			OLSKRoutePath: '/logout',
			OLSKRouteMethod: 'get',
			OLSKRouteFunction: exports.WKCActionLoginDestroy,
			OLSKRouteLanguages: ['en'],
		},
	};
};

//_ OLSKControllerSharedMiddlewares

exports.OLSKControllerSharedMiddlewares = function() {
	return {
		WKCSharedMiddlewareAuthenticate: [
			sharedController.WKCSharedMiddlewareEnsureDatabase,
			exports.WKCLoginMiddlewareAuthenticate,
		],
	};
};

//_ WKCLoginMiddlewareAuthenticate

exports.WKCLoginMiddlewareAuthenticate = function(req, res, next) {
	if (!req.session.WKCInsecureSessionToken || !req.session.WKCInsecureSessionToken.trim()) {
		return res.redirect(exports.OLSKControllerRoutes().WKCRouteLogin.OLSKRoutePath);
	}

	return next();
};

//_ WKCActionLoginIndex

exports.WKCActionLoginIndex = function(req, res, next) {
	return res.render([
		__dirname,
		'index',
	].join('/'), {});
};

//_ WKCActionLoginSubmit

exports.WKCActionLoginSubmit = function(req, res, next) {
	if (!process.env.WKC_SHARED_DATABASE_NAME) {
		throw new Error('WKCErrorMissingDatabaseName');
	}

	if (!req.body.WKCLoginUsername || !req.body.WKCLoginUsername.trim()) {
		return res.redirect(res.locals.OLSKCanonicalFor('WKCRouteLogin'));
	}

	if (!req.body.WKCLoginPassword || !req.body.WKCLoginPassword.trim()) {
		return res.redirect(res.locals.OLSKCanonicalFor('WKCRouteLogin'));
	}

	return req.OLSKSharedConnectionFor('WKCSharedConnectionMongo').OLSKConnectionClient.db(process.env.WKC_SHARED_DATABASE_NAME).collection('wkc_members').find({}).toArray(function(err, items) {
		if (err) {
			throw new Error('WKCErrorDatabaseFindFailed');
		}

		var memberObject = items.filter(function(e) {
			return req.body.WKCLoginUsername === e.WKCMemberHandle && req.body.WKCLoginPassword === e.WKCMemberInsecurePassword;
		}).pop();

		if (!memberObject) {
			return res.render([
				__dirname,
				'index',
			].join('/'), {
				WKCLoginUsername: req.body.WKCLoginUsername,
				WKCLoginError: true,
			});
		}

		req.session.WKCInsecureSessionToken = memberObject.WKCMemberHandle;

		return res.redirect(res.locals.OLSKCanonicalFor('WKCRouteNotes'));
	});
};

//_ WKCActionLoginDestroy

exports.WKCActionLoginDestroy = function(req, res, next) {
	req.session = null;

	return res.redirect(res.locals.OLSKCanonicalFor('WKCRouteHome'));
};
