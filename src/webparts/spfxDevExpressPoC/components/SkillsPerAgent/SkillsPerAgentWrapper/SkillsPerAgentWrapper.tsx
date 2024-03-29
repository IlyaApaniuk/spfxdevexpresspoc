import * as React from "react";
import { PrimaryButton } from "@fluentui/react/lib/Button";
import DataGrid, { Column, SearchPanel, Paging, Button, Editing } from "devextreme-react/data-grid";
// eslint-disable-next-line import/no-unresolved
import * as strings from "SpfxDevExpressPoCWebPartStrings";

import { IClientSkillItem } from "../../../models/skillsPerAgent/IClientSkillItem";
import SharePointService from "../../../services/SharePointService";
import SkillsPerAgentDialog from "../SkillsPerAgentDialog/SkillsPerAgentDialog";

import styles from "./SkillsPerAgentWrapper.module.scss";

export interface ISkillsPerAgentWrapperProps {
    sharePointService: SharePointService;
}

const SkillsPerAgentWrapper: React.FC<ISkillsPerAgentWrapperProps> = ({ sharePointService }) => {
    const [skills, setSkills] = React.useState<IClientSkillItem[]>([]);
    const [hideDialog, setHideDialog] = React.useState<boolean>(true);
    const [editableSkillItem, setEditableSkillItem] = React.useState<IClientSkillItem | null>(null);
    const [lastUpdate, setLastUpdate] = React.useState<number>(0);

    React.useEffect(() => {
        const loadSkills = async () => {
            try {
                const data = await sharePointService.getSkillPerAgentItems();

                setSkills(data);
            } catch (ex) {
                console.error(ex);
            }
        };

        loadSkills();
    }, [sharePointService, lastUpdate, hideDialog]);

    const onShowDialog = React.useCallback(() => {
        setEditableSkillItem(null);
        setHideDialog(false);
    }, []);

    const onShowEditDialog = React.useCallback(e => {
        setEditableSkillItem(e.row.data);
        setHideDialog(false);
    }, []);

    const onHideDialog = () => {
        setHideDialog(true);
        setLastUpdate(lastUpdate + 1);
    };

    return (
        <div className={styles.skillsWrapper}>
            <PrimaryButton text={strings.SkillPerAgentTableNewUpload} onClick={onShowDialog} />
            <DataGrid allowColumnReordering rowAlternationEnabled dataSource={skills} showBorders remoteOperations>
                <SearchPanel visible />
                <Editing allowUpdating />
                <Column dataField="id" visible={false} defaultSortOrder="desc" />
                <Column type="buttons" width={50}>
                    <Button name="edit" onClick={onShowEditDialog} />
                </Column>
                <Column caption={strings.SkillPerAgentTableAgentLabel} dataField="agent.value" />
                <Column caption={strings.SkillPerAgentTableSkillLabel} dataField="skill.value" />
                <Column caption={strings.SkillPerAgentTableScoreLabel} alignment="left" dataField="score" />
                <Paging defaultPageSize={10} />
            </DataGrid>
            <SkillsPerAgentDialog editableSkillItem={editableSkillItem} sharePointService={sharePointService} hideDialog={hideDialog} onClose={onHideDialog} />
        </div>
    );
};

export default SkillsPerAgentWrapper;
