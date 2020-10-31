//_ OLSKControllerRoutes

exports.OLSKControllerRoutes = function() {
	return {
		WKCRobotsRoute: {
			OLSKRoutePath: '/robots.txt',
			OLSKRouteMethod: 'get',
			OLSKRouteFunction (req, res, next) {
				return res.render(require('path').join(__dirname, 'view'), {
					WKCRobotsAllowedRouteConstants: [],
				});
			},
		},
	};
};
