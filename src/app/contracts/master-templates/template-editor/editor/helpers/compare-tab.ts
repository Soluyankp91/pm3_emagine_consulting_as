import { ICompareChanges } from "../entities";

export function LCS(X, Y) {
	const m = X.length;
	const n = Y.length;
	const L = [];

	for (let i = 0; i <= m; i++) {
		L[i] = [];
		for (let j = 0; j <= n; j++) {
			if (i === 0 || j === 0) {
				L[i][j] = 0;
			} else if (X[i - 1] === Y[j - 1]) {
				L[i][j] = L[i - 1][j - 1] + 1;
			} else {
				L[i][j] = Math.max(L[i - 1][j], L[i][j - 1]);
			}
		}
	}

	const result = [];
	let i = m,
		j = n;
	while (i > 0 && j > 0) {
		if (X[i - 1] === Y[j - 1]) {
			// result.unshift('  ' + X[i - 1]);
			i--;
			j--;
		} else if (L[i - 1][j] > L[i][j - 1]) {
			result.unshift('- ' + X[i - 1]);
			i--;
		} else {
			result.unshift('+ ' + Y[j - 1]);
			j--;
		}
	}

	while (i > 0) {
		result.unshift('- ' + X[i - 1]);
		i--;
	}

	while (j > 0) {
		result.unshift('+ ' + Y[j - 1]);
		j--;
	}

	return result.join('\n');
}

export function compareTexts(text1, text2) {
	let text1Lines = text1.split('\n');
	let text2Lines = text2.split('\n');
	let diff = [];

	let text1Index = 0;
	let text2Index = 0;

	while (text1Index < text1Lines.length || text2Index < text2Lines.length) {
		let text1Line = text1Lines[text1Index];
		let text2Line = text2Lines[text2Index];

		if (text1Line === text2Line) {
			diff.push({
				type: 'equal',
				text1Line: text1Line,
				text2Line: text2Line,
			});
			text1Index++;
			text2Index++;
		} else if (text1Lines.slice(text1Index).indexOf(text2Line) === -1) {
			diff.push({
				type: 'insert',
				text2Line: text2Line,
			});
			text2Index++;
		} else if (text2Lines.slice(text2Index).indexOf(text1Line) === -1) {
			diff.push({
				type: 'delete',
				text1Line: text1Line,
			});
			text1Index++;
		} else {
			diff.push({
				type: 'replace',
				text1Line: text1Line,
				text2Line: text2Line,
			});
			text1Index++;
			text2Index++;
		}
	}

	// console.log(diff);
	return diff;
}

export function highlightDifferencesConsole(diff) {
	for (let i = 0; i < diff.length; i++) {
		let type = diff[i].type;
		let text1Line = diff[i].text1Line || '';
		let text2Line = diff[i].text2Line || '';
		if (type === 'equal') {
			console.log(text1Line);
		} else if (type === 'insert') {
			console.log('\x1b[32m+ ' + text2Line + '\x1b[0m');
		} else if (type === 'delete') {
			console.log('\x1b[31m- ' + text1Line + '\x1b[0m');
		} else if (type === 'replace') {
			console.log('\x1b[31m- ' + text1Line + '\x1b[0m');
			console.log('\x1b[32m+ ' + text2Line + '\x1b[0m');
		}
	}
}

export function getDifferences(diff): ICompareChanges[] {
	let currentLine = 1;
	let changes = [];

	for (let i = 0; i < diff.length; i++) {
		let type = diff[i].type;
		let text1Line = diff[i].text1Line || '';
		let text2Line = diff[i].text2Line || '';

		if (type === 'equal') {
			currentLine++;
		} else if (type === 'insert') {
			changes.push({
				type: 'insert',
				line: currentLine,
				text: text2Line,
			});
			currentLine++;
		} else if (type === 'delete') {
			changes.push({
				type: 'delete',
				line: currentLine,
				text: text1Line,
			});
			currentLine++;
		} else if (type === 'replace') {
			changes.push({
				type: 'replace',
				line: currentLine,
				text: text1Line,
			});
			currentLine++;
			changes.push({
				type: 'replace',
				line: currentLine,
				text: text2Line,
			});
			currentLine++;
		}
	}
	return changes;
}
