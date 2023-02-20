import { ICompareChanges } from "../entities";
import { diffArrays } from 'diff';

export function compareTexts(text1, text2) {
	const diff = diffArrays(text1, text2);
	return diff;
}

export function getDifferences(diff): ICompareChanges[] {
	let currentLine = 0;
	let changes = [];

	for (let i = 0; i < diff.length; i++) {
		if (diff[i].added) {
			diff[i].value.forEach(item => {
				changes.push({
					type: 'delete',
					line: currentLine,
					text: item
				});
				currentLine++;
			})
		}

		if (diff[i].removed) {
			diff[i].value.forEach(item => {
				changes.push({
					type: 'insert',
					line: currentLine,
					text: item
				});
				currentLine++;
			})
		}

		if (!diff[i].added && !diff[i].removed) {
			diff[i].value.forEach(item => {
				currentLine++;
			})
		}
	}

	return changes;
}