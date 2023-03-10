import { EnvelopePreviewDto, RecipientPreviewDto, SignerType } from 'src/shared/service-proxies/service-proxies';

export enum ESignerTypeName {
	'Internal Emagine' = SignerType.InternalEmagine,
	'Client' = SignerType.Client,
	'Consultant' = SignerType.Consultant,
	'Supplier' = SignerType.Supplier,
}

export enum ESignerRole {
	'Sign contract' = 1,
	'Approve contract' = 2,
	'Receive copy of contract' = 3,
}

export enum EDocuSignMenuOption {
    SendViaDocuSign = 1,
    CreateDocuSignDraft = 2
}

export const DocuSignMenuItems = [
    {
        id: 1,
        name: 'Send via DocuSign',
        icon: 'send-via-docusign',
        option: EDocuSignMenuOption.SendViaDocuSign,
    },
    {
        id: 2,
        name: 'Create DocuSign envelope draft',
        icon: 'create-docusign-draft',
        option: EDocuSignMenuOption.CreateDocuSignDraft,
    }
]

export enum EEmailMenuOption {
    EditableDocFile = 1,
    AsPdfFile = 2
}

export const EmailMenuItems = [
    {
        id: 1,
        name: 'In editable *.docx format',
        icon: 'download-doc',
        option: EEmailMenuOption.EditableDocFile,
    },
    {
        id: 2,
        name: 'As *.pdf file',
        icon: 'download-pdf',
        option: EEmailMenuOption.AsPdfFile,
    }
]


export const RecipientMockedList: EnvelopePreviewDto[] = [
    new EnvelopePreviewDto({
        envelopeName: 'test name 1',
        recipients: [
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.Client,
                roleId: 1,
                signOrder: 2,
                externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1'
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.Consultant,
                roleId: 2,
                signOrder: 2,
                externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1'
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.InternalEmagine,
                roleId: 3,
                signOrder: 4,
                externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1'
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.Supplier,
                roleId: 1,
                signOrder: 2,
                externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1'
            })
        ]
    }),
    new EnvelopePreviewDto({
        envelopeName: 'test name 2',
        recipients: [
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.Client,
                roleId: 1,
                signOrder: 2,
                externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1'
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.Consultant,
                roleId: 2,
                signOrder: 2,
                externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1'
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.InternalEmagine,
                roleId: 3,
                signOrder: 4,
                externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1'
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.Supplier,
                roleId: 1,
                signOrder: 2,
                externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1'
            })
        ]
    }),
    new EnvelopePreviewDto({
        envelopeName: 'test name 1',
        recipients: [
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.Client,
                roleId: 1,
                signOrder: 2,
                externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1'
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.Consultant,
                roleId: 2,
                signOrder: 2,
                externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1'
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.InternalEmagine,
                roleId: 3,
                signOrder: 4,
                externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1'
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.Supplier,
                roleId: 1,
                signOrder: 2,
                externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1'
            })
        ]
    }),
    new EnvelopePreviewDto({
        envelopeName: 'test name 2',
        recipients: [
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.Client,
                roleId: 1,
                signOrder: 2,
                externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1'
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.Consultant,
                roleId: 2,
                signOrder: 2,
                externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1'
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.InternalEmagine,
                roleId: 3,
                signOrder: 4,
                externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1'
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.Supplier,
                roleId: 1,
                signOrder: 2,
                externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1'
            })
        ]
    }),
    new EnvelopePreviewDto({
        envelopeName: 'test name 1',
        recipients: [
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.Client,
                roleId: 1,
                signOrder: 2,
                externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1'
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.Consultant,
                roleId: 2,
                signOrder: 2,
                externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1'
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.InternalEmagine,
                roleId: 3,
                signOrder: 4,
                externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1'
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.Supplier,
                roleId: 1,
                signOrder: 2,
                externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1'
            })
        ]
    }),
    new EnvelopePreviewDto({
        envelopeName: 'test name 2',
        recipients: [
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.Client,
                roleId: 1,
                signOrder: 2,
                externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1'
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.Consultant,
                roleId: 2,
                signOrder: 2,
                externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1'
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.InternalEmagine,
                roleId: 3,
                signOrder: 4,
                externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1'
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.Supplier,
                roleId: 1,
                signOrder: 2,
                externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1'
            })
        ]
    }),new EnvelopePreviewDto({
        envelopeName: 'test name 1',
        recipients: [
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.Client,
                roleId: 1,
                signOrder: 2,
                externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1'
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.Consultant,
                roleId: 2,
                signOrder: 2,
                externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1'
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.InternalEmagine,
                roleId: 3,
                signOrder: 4,
                externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1'
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.Supplier,
                roleId: 1,
                signOrder: 2,
                externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1'
            })
        ]
    }),
    new EnvelopePreviewDto({
        envelopeName: 'test name 2',
        recipients: [
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.Client,
                roleId: 1,
                signOrder: 2,
                externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1'
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.Consultant,
                roleId: 2,
                signOrder: 2,
                externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1'
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.InternalEmagine,
                roleId: 3,
                signOrder: 4,
                externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1'
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.Supplier,
                roleId: 1,
                signOrder: 2,
                externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1'
            })
        ]
    }),
    new EnvelopePreviewDto({
        envelopeName: 'test name 1',
        recipients: [
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.Client,
                roleId: 1,
                signOrder: 2,
                externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1'
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.Consultant,
                roleId: 2,
                signOrder: 2,
                externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1'
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.InternalEmagine,
                roleId: 3,
                signOrder: 4,
                externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1'
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.Supplier,
                roleId: 1,
                signOrder: 2,
                externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1'
            })
        ]
    }),
    new EnvelopePreviewDto({
        envelopeName: 'test name 2',
        recipients: [
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.Client,
                roleId: 1,
                signOrder: 2,
                externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1'
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.Consultant,
                roleId: 2,
                signOrder: 2,
                externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1'
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.InternalEmagine,
                roleId: 3,
                signOrder: 4,
                externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1'
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.Supplier,
                roleId: 1,
                signOrder: 2,
                externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1'
            })
        ]
    })
]