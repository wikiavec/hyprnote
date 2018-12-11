/*!
 * wikiavec
 * Copyright(c) 2018 Rosano Coutinho
 * MIT Licensed
 */

//_ WKCModelArticlePrepare

exports.WKCModelArticlePrepare = function(inputData) {
	if (inputData.WKCArticlePublishDate !== undefined) {
		inputData.WKCArticlePublishDate = new Date(inputData.WKCArticlePublishDate);
	}

	return inputData;
};

//_ WKCModelInputDataIsArticleObject

exports.WKCModelInputDataIsArticleObject = function(inputData) {
	if (typeof inputData !== 'object' || inputData === null) {
		return false;
	}

	var errors = {};

	if (!(inputData.WKCArticlePublishDate instanceof Date) || Number.isNaN(inputData.WKCArticlePublishDate.getTime())) {
		errors.WKCArticlePublishDate = [
			'WKCErrorNotDate',
		];
	}

	if (inputData.WKCArticleTitle) {
		if (typeof inputData.WKCArticleTitle !== 'string') {
			errors.WKCArticleTitle = [
				'WKCErrorNotString',
			];
		}
	}

	if (inputData.WKCArticleBody) {
		if (typeof inputData.WKCArticleBody !== 'string') {
			errors.WKCArticleBody = [
				'WKCErrorNotString',
			];
		}
	}

	if (Object.keys(errors).length) {
		inputData.WKCErrors = errors;
		
		return false;
	}

	return true;
};

//_ WKCArticleHiddenPropertyNames

exports.WKCArticleHiddenPropertyNames = function() {
	return [
		'_id',
	];
};
