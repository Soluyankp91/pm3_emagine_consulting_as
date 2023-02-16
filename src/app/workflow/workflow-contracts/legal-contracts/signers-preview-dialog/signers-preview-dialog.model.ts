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
                signOrder: 2
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.Consultant,
                roleId: 2,
                signOrder: 2
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.InternalEmagine,
                roleId: 3,
                signOrder: 4
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.Supplier,
                roleId: 1,
                signOrder: 2
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
                signOrder: 2
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.Consultant,
                roleId: 2,
                signOrder: 2
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.InternalEmagine,
                roleId: 3,
                signOrder: 4
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.Supplier,
                roleId: 1,
                signOrder: 2
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
                signOrder: 2
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.Consultant,
                roleId: 2,
                signOrder: 2
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.InternalEmagine,
                roleId: 3,
                signOrder: 4
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.Supplier,
                roleId: 1,
                signOrder: 2
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
                signOrder: 2
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.Consultant,
                roleId: 2,
                signOrder: 2
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.InternalEmagine,
                roleId: 3,
                signOrder: 4
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.Supplier,
                roleId: 1,
                signOrder: 2
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
                signOrder: 2
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.Consultant,
                roleId: 2,
                signOrder: 2
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.InternalEmagine,
                roleId: 3,
                signOrder: 4
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.Supplier,
                roleId: 1,
                signOrder: 2
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
                signOrder: 2
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.Consultant,
                roleId: 2,
                signOrder: 2
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.InternalEmagine,
                roleId: 3,
                signOrder: 4
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.Supplier,
                roleId: 1,
                signOrder: 2
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
                signOrder: 2
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.Consultant,
                roleId: 2,
                signOrder: 2
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.InternalEmagine,
                roleId: 3,
                signOrder: 4
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.Supplier,
                roleId: 1,
                signOrder: 2
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
                signOrder: 2
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.Consultant,
                roleId: 2,
                signOrder: 2
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.InternalEmagine,
                roleId: 3,
                signOrder: 4
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.Supplier,
                roleId: 1,
                signOrder: 2
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
                signOrder: 2
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.Consultant,
                roleId: 2,
                signOrder: 2
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.InternalEmagine,
                roleId: 3,
                signOrder: 4
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.Supplier,
                roleId: 1,
                signOrder: 2
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
                signOrder: 2
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.Consultant,
                roleId: 2,
                signOrder: 2
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.InternalEmagine,
                roleId: 3,
                signOrder: 4
            }),
            new RecipientPreviewDto({
                agreementSignerId: 1,
                name: 'Helen Vaxx',
                email: 'email@gmail.com',
                signerType: SignerType.Supplier,
                roleId: 1,
                signOrder: 2
            })
        ]
    })
]
