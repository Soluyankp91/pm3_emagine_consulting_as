export class Tab {
  id: number;
  text: string;
  // icon: string;
  content: string;
}

const tabs: Tab[] = [
  {
    id: 0,
    text: 'File',
    // icon: 'file',
    content: 'FILE',
  },
  {
    id: 1,
    text: 'Format',
    // icon: 'comment',
    content: 'Comment tab content',
  },
  {
    id: 2,
    text: 'Merge Fields',
    // icon: 'find',
    content: 'Find tab content',
  },
  {
    id: 2,
    text: 'Compare',
    // icon: 'find',
    content: 'Find tab content',
  },
  {
    id: 2,
    text: 'View',
    // icon: 'find',
    content: 'Find tab content',
  },
];


export function getTabs(): Tab[] {
  return tabs;
}
