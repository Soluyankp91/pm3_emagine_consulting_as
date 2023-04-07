import { BaseEnumDto } from "../entities/contracts.interfaces";

export function GetDocumentTypesByRecipient(possibleDocumentTypes: BaseEnumDto [], recipientTypeId: number) {
    switch (recipientTypeId) {
        case 1:
            return [possibleDocumentTypes[0], possibleDocumentTypes[1], possibleDocumentTypes[4]];
        case 2:
            return [possibleDocumentTypes[0], possibleDocumentTypes[1], possibleDocumentTypes[4]];
        case 3:
            return [possibleDocumentTypes[0], possibleDocumentTypes[2], possibleDocumentTypes[4]];
        case 4:
            return [possibleDocumentTypes[0], possibleDocumentTypes[3], possibleDocumentTypes[4]];
    }
}