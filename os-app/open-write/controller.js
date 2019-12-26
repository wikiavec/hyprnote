exports.OLSKControllerRoutes = function() {
	return [{
		OLSKRoutePath: '/write',
		OLSKRouteMethod: 'get',
		OLSKRouteSignature: 'KVCWriteRoute',
		OLSKRouteFunction (req, res, next) {
			return res.render(require('path').join(__dirname, 'ui-view.ejs'));
		},
		OLSKRouteLanguages: ['en', 'fr', 'es'],
		OLSKRouteMiddlewares: [
			'KVCSharedDropboxAppKeyGuardMiddleware',
			'KVCSharedDonateLinkGuardMiddleware',
		],
		_OLSKRouteSkipLanguageRedirect: true,
	}, {
		OLSKRoutePath: '/panel/write',
		OLSKRouteMethod: 'get',
		OLSKRouteSignature: 'KVCWriteLegacyRoute',
		OLSKRouteRedirect: '/write',
	}];
};
