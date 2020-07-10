const mod = {

	KVCTemplatePlaintextTitle (inputData) {
		if (typeof inputData !== 'string') {
			throw new Error('KVCErrorInputNotValid');
		}

		return inputData.split('\n').shift();
	},

	KVCTemplatePlaintextBody (inputData) {
		if (typeof inputData !== 'string') {
			throw new Error('KVCErrorInputNotValid');
		}

		return inputData.split('\n').slice(1).join('\n').trim();
	},

	KVCTemplateRemappedLinks (param1, param2) {
		if (typeof param1 !== 'string') {
			throw new Error('KVCErrorInputNotValid');
		}

		if (typeof param2 !== 'object' || param2 === null) {
			throw new Error('KVCErrorInputNotValid');
		}

		return Object.entries(param2).reduce(function (coll, e) {
			return coll.split(`[[${ e[0] }]]`).join(`[${ e[0] }](${ e[1] })`);
		}, param1);
	},

	KVCTemplateHTML (showdown, inputData) {
		if (typeof showdown.Converter !== 'function') {
			throw new Error('KVCErrorInputNotValid');
		}
		
		if (typeof inputData !== 'string') {
			throw new Error('KVCErrorInputNotValid');
		}

		const showdownConverter = new showdown.Converter();
		showdownConverter.setOption('simpleLineBreaks', true);
		showdownConverter.setOption('simplifiedAutoLink', true);
		showdownConverter.setOption('noHeaderId', true);

		return showdownConverter.makeHtml(inputData);
	},

	KVCTemplateTokensMap (showdown, body, options) {
		if (typeof showdown.Converter !== 'function') {
			throw new Error('KVCErrorInputNotValid');
		}
		
		if (typeof body !== 'string') {
			throw new Error('KVCErrorInputNotValid');
		}

		if (typeof options !== 'object' || options === null) {
			throw new Error('KVCErrorInputNotValid');
		}

		return Object.fromEntries([
			[mod.KVCTemplateTokenPostTitle(), mod.KVCTemplatePlaintextTitle(body)],
			[mod.KVCTemplateTokenPostBody(), mod.KVCTemplateHTML(showdown, mod.KVCTemplatePlaintextBody(body))],
			[mod.KVCTemplateTokenRootURL(), options.KVCOptionRootURL],
			[mod.KVCTemplateTokenRootURLLegacy(), options.KVCOptionRootURL],
		].map(function (e) {
			e[0] = `{${ e[0] }}`;

			return e;
		}));
	},

	KVCTemplateBlocks (options) {
		if (typeof options !== 'object' || options === null) {
			throw new Error('KVCErrorInputNotValid');
		}

		return Object.keys(options).reduce(function (coll, item) {
			if (item === 'KVCOptionRootURL') {
				coll.push(mod.KVCTemplateTokenRootURL());
			}

			if (item === 'KVCOptionIsRoot') {
				coll.push(mod.KVCTemplateTokenRootPage());
			}

			return coll;
		}, []);
	},

	KVCTemplateTokenPostTitle () {
		return 'Title';
	},

	KVCTemplateTokenPostBody () {
		return 'Body';
	},

	KVCTemplateTokenRootURL () {
		return 'RootURL';
	},

	KVCTemplateTokenRootURLLegacy () {
		return 'BlogURL';
	},

	KVCTemplateTokenRootPage () {
		return 'HomePage';
	},

	_KVCTemplateCollapseBlocksReplaceMatches (string, matchOpen, matchClosed, exclude) {
		return string.slice(0, matchOpen.index) + (exclude ? '' : string.slice(matchOpen.index + matchOpen[0].length, matchClosed.index)) + string.slice(matchClosed.index + matchClosed[0].length);
	},

	KVCTemplateCollapseBlocks (param1, param2) {
		if (typeof param1 !== 'string') {
			throw new Error('KVCErrorInputNotValid');
		}

		if (!Array.isArray(param2)) {
			throw new Error('KVCErrorInputNotValid');
		}

		let outputData = param1;

		let startIndex = -1;
		let lastIndex;

		while (startIndex < outputData.length) {
			if (startIndex === lastIndex) {
				startIndex = Infinity;
				return outputData;
			}

			lastIndex = startIndex;

			(function () {
				let matchOpen = outputData.match(/\{block:(\w+)\}/i);

				if (!matchOpen) {
					startIndex = outputData.length;
					return;
				}

				let matchClosed = outputData.match(new RegExp(`\\{\\/block:${ matchOpen[1] }\}`));

				if (!matchClosed) {
					startIndex = matchOpen.index + matchOpen[0].length;
					return;
				}

				outputData = mod._KVCTemplateCollapseBlocksReplaceMatches(outputData, matchOpen, matchClosed, !param2.includes(matchOpen[1]));

				startIndex = matchOpen.index;
			})();
		}

		return outputData;
	},

	KVCTemplateViewDefault (inputData) {
		if (typeof inputData !== 'function') {
			throw new Error('KVCErrorInputNotValid');
		}

		return `<!DOCTYPE html>
<html>
<head>
	<title>{${ mod.KVCTemplateTokenPostTitle() }}</title>
	<style type="text/css">
		:root {
			--KVCBoxFontFamily: 'Lucida Grande', sans-serif;
			--KVCBoxFontSize: 10.5pt;

			--KVCBoxHeadingFontFamily: 'Helvetica Neue';

			--KVCBoxBackground: white;
			--KVCBoxForeground: black;
		}

		.KVCBox {
			padding: 10px;
			max-width: 400px;

			margin: auto;

			background: var(--KVCBoxBackground);
			font-family: var(--KVCBoxFontFamily);
			font-size: var(--KVCBoxFontSize);
			color: var(--KVCBoxForeground);
		}

		.KVCBox h1, .KVCBox h2, .KVCBox h3, .KVCBox h4 {
			font-family: var(--KVCBoxHeadingFontFamily);
		}

		.KVCBox ul {
			padding-left: 30px;
		}

		.KVCBox hr {
			height: 1px;
			border: none;

			background: var(--KVCBoxForeground);
		}

		.KVCBox code {
			display: inline-block;
			padding: 3px;

			background: hsl(0, 0%, 94%);
			color: hsl(0, 0%, 20%);
		}
	</style>

	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<meta name="viewport" content="width=device-width" />
</head>
<body class="KVCBox">

<a class="KVCRootLink" href="{${ mod.KVCTemplateTokenRootURL() }}">${ inputData('KVCRootLinkText') }</a>

<hr />

<h1 class="KVCArticleTitle">{${ mod.KVCTemplateTokenPostTitle() }}</h1>

<article class="KVCArticleBody">

{${ mod.KVCTemplateTokenPostBody() }}

</article>

</body>
</html>`;
	},

};

Object.assign(exports, mod);
