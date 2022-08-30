import * as React from "react";
import { PrimaryButton } from "@fluentui/react/lib/Button";
import DataGrid, { Column, SearchPanel, Paging, Button, Editing } from "devextreme-react/data-grid";
// eslint-disable-next-line import/no-unresolved
import * as strings from "SpfxDevExpressPoCWebPartStrings";

import { IRecord } from "../../../models/records/IRecord";
import SharePointService from "../../../services/SharePointService";
import RecorderDialog from "../RecorderDialog/RecorderDialog";

import styles from "./RecordsWrapper.module.scss";

export interface IRecordsWrapperProps {
    activeSiteKey: string | number | null;
    sharePointService: SharePointService;
    disableCreateNewRecord: boolean;
}

const RecordsWrapper: React.FC<IRecordsWrapperProps> = ({ activeSiteKey, disableCreateNewRecord, sharePointService }) => {
    const [hideDialog, setHideDialog] = React.useState<boolean>(true);
    const [records, setRecords] = React.useState<IRecord[]>([]);
    const [editableRecord, setEditableRecord] = React.useState<IRecord | null>(null);

    React.useEffect(() => {
        const loadRecords = async () => {
            try {
                const data = await sharePointService.getRecords();

                setRecords(data);
            } catch (ex) {
                console.error(ex);
            }
        };

        loadRecords();
    }, [sharePointService, hideDialog, activeSiteKey]);

    const recordCellRender = (settings: { data: IRecord }) => {
        // eslint-disable-next-line jsx-a11y/anchor-is-valid
        return <a href={null}>{settings.data.label}</a>;
    };

    const onShowEditDialog = React.useCallback(e => {
        setEditableRecord(e.row.data);
        setHideDialog(false);
    }, []);

    const onShowDialog = React.useCallback(() => {
        setEditableRecord(null);
        setHideDialog(false);
    }, []);

    const onHideDialog = React.useCallback(() => {
        setHideDialog(true);
    }, []);

    return (
        <div className={styles.recordsWrapper}>
            <PrimaryButton style={{ display: disableCreateNewRecord ? "none" : "block" }} text={strings.OpenDialogButton} onClick={onShowDialog} />
            <DataGrid allowColumnReordering rowAlternationEnabled dataSource={records} showBorders remoteOperations>
                <SearchPanel visible />
                <Editing allowUpdating />
                <Column dataField="label" visible={false} />
                <Column type="buttons" width={50}>
                    <Button name="edit" onClick={onShowEditDialog} />
                </Column>
                <Column caption={strings.TableRecordLabel} width={150} cellRender={recordCellRender} dataType="text" />
                <Column caption={strings.TableModifiedLabel} width={100} dataField="modified" defaultSortOrder="desc" dataType="date" />
                <Paging defaultPageSize={10} />
            </DataGrid>
            <RecorderDialog editableRecord={editableRecord} sharePointService={sharePointService} hideDialog={hideDialog} onClose={onHideDialog} />
        </div>
    );
};

export default RecordsWrapper;
