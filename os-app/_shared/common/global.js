import OLSKInternational from 'OLSKInternational';

let localizationDictionary = JSON.parse(`{"OLSK_I18N_SEARCH_REPLACE":"OLSK_I18N_SEARCH_REPLACE"}`);

export const OLSKLocalized = function(translationConstant) {
	return OLSKInternational.OLSKInternationalLocalizedString(translationConstant, localizationDictionary[window.OLSKPublicConstants('OLSKSharedPageCurrentLanguage')]);
};

export const _WIKIsTestingBehaviour = function () {
	if (typeof require !== 'undefined') {
		return false;
	}

	if (typeof navigator === 'undefined') {
		return false;
	}

	return navigator.appName === 'Zombie';
};
