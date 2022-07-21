declare interface ISpfxDevExpressPoCWebPartStrings {
    PropertyPaneDescription: string;
    SettingsGroupName: string;
    HeaderLabel: string;
    AppLocalEnvironmentSharePoint: string;
    AppLocalEnvironmentTeams: string;
    AppSharePointEnvironment: string;
    AppTeamsTabEnvironment: string;
    OpenDialogButton: string;
    NotificationUploadedSuccessfully: string;
    NotificationUploadedFailed: string;
    NotificationEmptyRecordName: string;
    RecordNameTextFieldLabel: string;
    DialogTitle: string;
}

declare module "SpfxDevExpressPoCWebPartStrings" {
    const strings: ISpfxDevExpressPoCWebPartStrings;
    export = strings;
}
