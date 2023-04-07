import { MailMergeTabCommandId, RichEdit } from "devexpress-richedit";

export namespace TransformMergeFiels {
  
  type Paragraph = {
    start: number,
    end: number
  }
  
  const findTextInsideCurlyBracesExp = /\{|\}/gi;
  const findBracesExp = /{([^}]+)}/g;
  
  export function getIndexes(str: string, prgph: Paragraph): Array<Paragraph> {
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
        start: firstIndexes[index] + prgph.start,
        end: lastIndexes[index] + prgph.start
      })
    });
  
    return result;
  }
  
  export function updateMergeFields(rich: RichEdit): void {
    rich.beginUpdate();
    rich.history.beginTransaction();
    
    const paragraphsCount = rich.document.paragraphs.count
  
    for (let i = 0; i < paragraphsCount; i++) {
      
      const prgph = rich.document.paragraphs.getByIndex(i);
      const text = rich.document.getText(prgph.interval);
  
      if (text.indexOf('{') > -1) {
        let match = text.match(findBracesExp);
        
        if (match.length > 1) {
          match.forEach((item, index) => {
            updateMultiMergeFileds(rich, index, i);
          })
  
        } else {
  
          const firstIndex = text.indexOf('{');
          const lastIndex = text.indexOf('}');
  
          const isMergeField = rich.document.fields.find({
            start: prgph.interval.start,
            length: prgph.interval.length - 1
          });
  
          if (!isMergeField.length) {
            const arr = text.match(findBracesExp);
            const mergeFieldName = arr.map(item => item.replace(findTextInsideCurlyBracesExp, ''));
  
            rich.document.fields.createMergeField(prgph.interval.end - 1, mergeFieldName[0]);
            rich.document.deleteText({
              start: prgph.interval.start + firstIndex,
              length: lastIndex - firstIndex + 1
            })
          }
        }
      }
    }
  
    rich.executeCommand(MailMergeTabCommandId.UpdateAllFields);

    rich.history.endTransaction();
    rich.endUpdate();
  }
  
  function updateMultiMergeFileds(rich: RichEdit, index: number, lineIndex: number): void {
    rich.beginUpdate();
    rich.history.beginTransaction();

    const prgph = rich.document.paragraphs.getByIndex(lineIndex);
    const text = rich.document.getText(prgph.interval);
  
    let item = getIndexes(text, prgph.interval)[index];
  
    const firstIndex = item.start;
    const lastIndex = item.end;
  
    const isMergeField = rich.document.fields.find({
      start: firstIndex,
      length: lastIndex - firstIndex - 1
    });
  
    if (!isMergeField.length) {
      const arr = text.match(findBracesExp);
      const mergeFieldName = arr.map(item => item.replace(findTextInsideCurlyBracesExp, ''));
  
      rich.document.fields.createMergeField(lastIndex + 1, mergeFieldName[index]);
      rich.document.deleteText({
        start: firstIndex,
        length: lastIndex - firstIndex + 1
      })
    }

    rich.endUpdate();
    rich.history.endTransaction();
  }
}