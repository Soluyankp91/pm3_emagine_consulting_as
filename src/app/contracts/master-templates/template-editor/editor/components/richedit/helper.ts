export function getIndexes(str: string, p: {start: number}): Array<{start: number, end: number}> {
  const firstIndexes = [];
  const lastIndexes = [];
  const result = [];

  let match;
  let firstIndexesRegex = new RegExp(/{/g);
 
  while (match = firstIndexesRegex.exec(str)) {
    firstIndexes.push(match.index);
  }

  let lastIndexesRegex = new RegExp(/}/g);
  while (match = lastIndexesRegex.exec(str)) {
    lastIndexes.push(match.index);
  }

  firstIndexes.forEach((n, index) => {
    result.push({
      start: firstIndexes[index] + p.start,
      end: lastIndexes[index] + p.start
    })
  });

  return result;
}
