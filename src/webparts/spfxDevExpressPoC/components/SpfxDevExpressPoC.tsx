import * as React from "react";
import { PrimaryButton } from "@fluentui/react/lib/Button";
import DataGrid, { Column, SearchPanel, Pager, Paging } from "devextreme-react/data-grid";
// eslint-disable-next-line import/no-unresolved
import * as strings from "SpfxDevExpressPoCWebPartStrings";

import SharePointService from "../services/SharePointService";
import { IRecord } from "../models/IRecord";

import styles from "./SpfxDevExpressPoC.module.scss";
import RecorderDialog from "./RecorderDialog/RecorderDialog";

export interface ISpfxDevExpressPoCProps {
    headerLabel: string;
    uploadService: SharePointService;
}

const pageSizes = [5, 10, 25];

const SpfxDevExpressPoC: React.FC<ISpfxDevExpressPoCProps> = ({ uploadService }) => {
    const [hideDialog, setHideDialog] = React.useState<boolean>(true);
    const [records, setRecords] = React.useState<IRecord[]>([]);

    React.useEffect(() => {
        const loadRecords = async () => {
            const data = await uploadService.getRecords();

            setRecords(data);
        };

        loadRecords();
    }, [uploadService, hideDialog]);

    const recordCellRender = (settings: { data: IRecord }) => {
        return (
            <a target="_blank" rel="noreferrer" href={settings.data.url}>
                {settings.data.label}
            </a>
        );
    };

    const onHideDialog = React.useCallback(() => {
        setHideDialog(false);
    }, []);

    const onShowDialog = React.useCallback(() => {
        setHideDialog(true);
    }, []);

    return (
        <div className={styles.spfxDevExpressWrapper}>
            <PrimaryButton text={strings.OpenDialogButton} onClick={onHideDialog} />
            <DataGrid allowColumnReordering rowAlternationEnabled dataSource={records} showBorders remoteOperations>
                <SearchPanel visible highlightCaseSensitive />
                <Column caption={strings.TableRecordLabel} width={150} cellRender={recordCellRender} />
                <Column caption={strings.TableCreatedLabel} width={100} dataField="created" defaultSortOrder="desc" dataType="date" />
                <Pager allowedPageSizes={pageSizes} showPageSizeSelector />
                <Paging defaultPageSize={5} />
            </DataGrid>
            <RecorderDialog uploadService={uploadService} hideDialog={hideDialog} onClose={onShowDialog} />
        </div>
    );
};

export default SpfxDevExpressPoC;
