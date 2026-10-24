import { CustomNetTableName } from '../vscripts/enums/enums';

declare global {
    interface CustomNetTableDeclarations {
        [CustomNetTableName.clientAbilityLUA]: Record<string, any>
    }
}