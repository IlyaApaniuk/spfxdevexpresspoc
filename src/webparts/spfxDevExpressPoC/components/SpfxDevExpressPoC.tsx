import * as React from "react";
import { PrimaryButton } from "@fluentui/react/lib/Button";
import DataGrid, { Column } from "devextreme-react/data-grid";
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

    return (
        <div className={styles.spfxDevExpressWrapper}>
            <PrimaryButton text={strings.OpenDialogButton} onClick={() => setHideDialog(false)} />
            <DataGrid dataSource={records} showBorders={true}>
                <Column caption="Record" width={200} cellRender={recordCellRender} />
            </DataGrid>
            <RecorderDialog uploadService={uploadService} hideDialog={hideDialog} onClose={() => setHideDialog(true)} />
        </div>
    );
};

export default SpfxDevExpressPoC;
