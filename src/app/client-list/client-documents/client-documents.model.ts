export class FolderNode {
    name: string | undefined;
    files?: string[] | undefined;
    children?: FolderNode[] | undefined;
}

export class FolderFlatNode {
    constructor(
        public expandable: boolean,
        public name: string | undefined,
        public level: number,
        public files?: string[] | undefined,
        public children?: FolderNode[] | undefined
    ) {}
}

export const TREE_DATA: FolderNode[] = [
    {
        name: 'Folder1',
        files: [
            'File folder1'
        ],
        children: [
            {
                name: 'Subfolder11',
                files: [
                    'File 11-1',
                    'File 11-2'
                ]
            },
            {
                name: 'Subfolder12',
                files: [
                    'File 12-1',
                    'File 12-2'
                ]
            },
            {
                name: 'Subfolder13',
                children: [
                    {
                        name: 'Subfolder131',
                        files: [
                            'File 131-1',
                            'File 131-2'
                        ]
                    }
                ]
            }
        ]
    }, {
        name: 'Folder 2',
        children: [
            {
                name: 'Subfolder2-1',
                children: [
                    {
                        name: 'Subfolder21-1',
                        files: [
                            'File 211-1'
                        ]
                    },
                    {
                        name: 'Brussel sprouts',
                        files: [
                            'File 211-2'
                        ]
                    }
                ]
            }, {
                name: 'Subfolder2-2',
                children: [
                    {
                        name: 'Subfolder22-1',
                        files: [
                            'Files 22-1'
                        ]
                    },
                    {
                        name: 'Subfolder22-2',
                        files: [
                            'Files 22-2'
                        ]
                    }
                ]
            },
        ]
    },
];
