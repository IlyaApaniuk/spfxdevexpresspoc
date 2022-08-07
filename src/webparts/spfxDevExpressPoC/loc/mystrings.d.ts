declare interface ISpfxDevExpressPoCWebPartStrings {
    PropertyPaneDescription: string;
    SettingsGroupName: string;
    SourceLibraryNameLable: string;
    PickSourceSiteLabel: string;
    DisableCreateNewRecordLabel: string;
    AppLocalEnvironmentSharePoint: string;
    AppLocalEnvironmentTeams: string;
    AppSharePointEnvironment: string;
    AppTeamsTabEnvironment: string;
    OpenDialogButton: string;
    NotificationUploadedSuccessfully: string;
    NotificationUploadedFailed: string;
    NotificationEmptyRecordName: string;
    RecordNameTextFieldLabel: string;
    RecordFormatDropdownLabel: string;
    NewRecordingDialogTitle: string;
    EditRecordingDialogTitle: string;
    StartRecordLabel: string;
    RerecordLabel: string;
    StopRecordLabel: string;
    PauseRecordLabel: string;
    ResueRecordLabel: string;
    SaveRecordLabel: string;
    CancelRecordLabel: string;
    TableRecordLabel: string;
    TableModifiedLabel: string;
}

declare module "SpfxDevExpressPoCWebPartStrings" {
    const strings: ISpfxDevExpressPoCWebPartStrings;
    export = strings;
}
