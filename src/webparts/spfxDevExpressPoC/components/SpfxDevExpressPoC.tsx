import * as React from "react";
import { PrimaryButton } from "@fluentui/react/lib/Button";
import DataGrid, { Column, SearchPanel, Paging, Button, Editing } from "devextreme-react/data-grid";
// eslint-disable-next-line import/no-unresolved
import * as strings from "SpfxDevExpressPoCWebPartStrings";

import SharePointService from "../services/SharePointService";
import { IRecord } from "../models/IRecord";

import styles from "./SpfxDevExpressPoC.module.scss";
import RecorderDialog from "./RecorderDialog/RecorderDialog";

export interface ISpfxDevExpressPoCProps {
    libraryName: string;
    sourceSite: string;
    uploadService: SharePointService;
}

const SpfxDevExpressPoC: React.FC<ISpfxDevExpressPoCProps> = ({ libraryName, sourceSite, uploadService }) => {
    const [hideDialog, setHideDialog] = React.useState<boolean>(true);
    const [records, setRecords] = React.useState<IRecord[]>([]);
    const [editableRecord, setEditableRecord] = React.useState<IRecord | null>(null);

    React.useEffect(() => {
        const loadRecords = async () => {
            uploadService.libraryName = libraryName;
            uploadService.siteUrl = sourceSite;
            const data = await uploadService.getRecords();

            setRecords(data);
        };

        loadRecords();
    }, [uploadService, hideDialog, libraryName, sourceSite]);

    const recordCellRender = (settings: { data: IRecord }) => {
        return (
            <a target="_blank" rel="noreferrer" href={settings.data.url}>
                {settings.data.label}
            </a>
        );
    };

    const onShowEditDialog = React.useCallback(e => {
        setEditableRecord(e.row.data);
        setHideDialog(false);
    }, []);

    const onShowDialog = React.useCallback(() => {
        setHideDialog(false);
    }, []);

    const onHideDialog = React.useCallback(() => {
        setHideDialog(true);
    }, []);

    return (
        <div className={styles.spfxDevExpressWrapper}>
            <PrimaryButton text={strings.OpenDialogButton} onClick={onShowDialog} />
            <DataGrid allowColumnReordering rowAlternationEnabled dataSource={records} showBorders remoteOperations>
                <SearchPanel visible highlightCaseSensitive />
                <Editing allowUpdating />
                <Column type="buttons" width={50}>
                    <Button name="edit" onClick={onShowEditDialog} />
                </Column>
                <Column caption={strings.TableRecordLabel} width={150} dataField="label" cellRender={recordCellRender} dataType="text" />
                <Column caption={strings.TableCreatedLabel} width={100} dataField="created" defaultSortOrder="desc" dataType="date" />
                <Paging defaultPageSize={10} />
            </DataGrid>
            <RecorderDialog editableRecord={editableRecord} uploadService={uploadService} hideDialog={hideDialog} onClose={onHideDialog} />
        </div>
    );
};

export default SpfxDevExpressPoC;
