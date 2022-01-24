export class FolderNode {
    name: string | undefined;
    files?: string[] | undefined;
    children?: FolderNode[] | undefined;
    level?: number | undefined;
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

export enum DocumentSideNavItem {
    General = 1,
    Contracts = 2,
    Evaluations = 3
}

export class DocumentSideNavDto {
    name: string;
    selected: boolean;
    enumValue: number;
}

export const DocumentSideNavigation: DocumentSideNavDto[] = [
    {
        name: 'General',
        selected: true,
        enumValue: DocumentSideNavItem.General
    },
    {
        name: 'Contracts',
        selected: false,
        enumValue: DocumentSideNavItem.Contracts
    },
    {
        name: 'Evaluations',
        selected: false,
        enumValue: DocumentSideNavItem.Evaluations
    }
];

export const TREE_DATA: FolderNode[] = [
    {
        name: 'Folder1',
        level: 1,
        files: [
            'File folder1'
        ],
        children: [
            {
                name: 'Subfolder11',
                level: 2,
                files: [
                    'File 11-1',
                    'File 11-2'
                ]
            },
            {
                name: 'Subfolder12',
                level: 2,
                files: [
                    'File 12-1',
                    'File 12-2'
                ]
            },
            {
                name: 'Subfolder13',
                level: 2,
                children: [
                    {
                        name: 'Subfolder131',
                        level: 3,
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
        files: [
            'File 2 - main'
        ],
        level: 1,
        children: [
            {
                name: 'Subfolder2-1',
                level: 2,
                children: [
                    {
                        name: 'Subfolder21-1',
                        level: 3,
                        files: [
                            'File 211-1'
                        ]
                    },
                    {
                        name: 'Brussel sprouts',
                        level: 3,
                        files: [
                            'File 211-2'
                        ]
                    }
                ]
            }, {
                name: 'Subfolder2-2',
                level: 2,
                children: [
                    {
                        name: 'Subfolder22-1',
                        level: 3,
                        files: [
                            'Files 22-1'
                        ]
                    },
                    {
                        name: 'Subfolder22-2',
                        level: 3,
                        files: [
                            'Files 22-2'
                        ]
                    }
                ]
            },
        ]
    },
];
