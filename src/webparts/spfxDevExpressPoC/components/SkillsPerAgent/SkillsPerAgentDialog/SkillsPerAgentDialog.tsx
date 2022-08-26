import * as React from "react";
import { Dialog, DialogType, DialogFooter } from "@fluentui/react/lib/Dialog";
import { DefaultButton, PrimaryButton } from "@fluentui/react/lib/Button";
import { Spinner, SpinnerSize } from "@fluentui/react/lib/Spinner";
// import { TextField } from "@fluentui/react/lib/TextField";
// eslint-disable-next-line import/named
import { Dropdown } from "@fluentui/react/lib/Dropdown";
// eslint-disable-next-line import/no-unresolved
import * as strings from "SpfxDevExpressPoCWebPartStrings";

import { IClientSkillItem } from "../../../models/skillsPerAgent/IClientSkillItem";
import SharePointService from "../../../services/SharePointService";
import { IFieldValues } from "../../../models/skillsPerAgent/IFieldValues";
import parseSkillPerAgentFieldsResponse from "../../../utils/parsers/parseSkillPerAgentFieldsResponse";
import ScoreSlider from "../ScoreSlider/ScoreSlider";

import styles from "./SkillsPerAgentDialog.module.scss";

export interface ISkillsPerAgentDialogProps {
    sharePointService: SharePointService;
    onClose: () => void;
    hideDialog: boolean;
    editableSkillItem?: IClientSkillItem;
}

const dialogContentProps = {
    type: DialogType.normal,
    showCloseButton: true
};

const SkillsPerAgentDialog: React.FC<ISkillsPerAgentDialogProps> = ({ sharePointService, onClose, hideDialog, editableSkillItem }) => {
    const [status, setStatus] = React.useState<{ type: "loading" | "uploading" | "success" | "error"; message?: string } | null>(null);
    const [fieldValues, setFieldValues] = React.useState<IFieldValues | null>(null);
    const [agent, setAgent] = React.useState<string | null>(editableSkillItem?.agent);
    const [skill, setSkill] = React.useState<string | null>(editableSkillItem?.skill);
    const [score, setScore] = React.useState<number | null>(editableSkillItem?.score);

    React.useEffect(() => {
        const loadFieldValues = async () => {
            try {
                setStatus({ type: "loading" });
                const values = await sharePointService.getListFieldValues("SkillsPerAgent", ["Skill", "Agent"], parseSkillPerAgentFieldsResponse);

                setFieldValues(values);
                setStatus(null);
            } catch (ex) {
                setStatus({ type: "error", message: (ex as Error).message });
            }
        };

        loadFieldValues();
    }, [sharePointService]);

    const onDialogClose = () => {
        onClose();
    };

    const onReset = () => {
        setStatus(null);
        setAgent(null);
        setSkill(null);
        setScore(null);
    };

    const uploadChanges = async () => {
        try {
            setStatus({ type: "uploading" });
            const isUploaded = await sharePointService.updateSkillPerAgent("SkillsPerAgent", { id: editableSkillItem.id, agent, skill, score });

            setStatus({ type: isUploaded ? "success" : "error" });
            onReset();
            onClose();
        } catch (ex) {
            setStatus({ type: "error", message: (ex as Error).message });
        }
    };

    const uploadNewItem = async () => {
        try {
            setStatus({ type: "uploading" });
            const isUploaded = await sharePointService.createSkillPerAgentItem("SkillsPerAgent", { agent, skill, score, id: -1 });

            setStatus({ type: isUploaded ? "success" : "error" });
            onReset();
            onClose();
        } catch (ex) {
            setStatus({ type: "error", message: (ex as Error).message });
        }
    };

    return (
        <Dialog
            styles={{
                main: {
                    ["@media (min-width: 640px)"]: {
                        width: 450,
                        minWidth: 450
                    },
                    ["@media (min-width: 1007px"]: {
                        width: 500,
                        minWidth: 500
                    }
                }
            }}
            minWidth={600}
            hidden={hideDialog}
            dialogContentProps={{ ...dialogContentProps, title: editableSkillItem ? strings.EditSkillDialogTitle : strings.NewSkillDialogTitle }}
            onDismiss={onDialogClose}
        >
            <div className={styles.skillPerAgentWrapper}>
                {(status?.type === "uploading" || status?.type === "loading") && (
                    <div className={styles.uploading}>
                        <Spinner size={SpinnerSize.large} />
                    </div>
                )}
                <div className={styles.controlsWrapper}>
                    <Dropdown
                        className={styles.dropdown}
                        options={fieldValues?.["Agent"]}
                        selectedKey={agent || editableSkillItem?.agent}
                        label={strings.SkillPerAgentAgentDropdownLabel}
                        onChange={(event, option) => setAgent(option.text)}
                    />
                    <Dropdown
                        className={styles.dropdown}
                        options={fieldValues?.["Skill"]}
                        selectedKey={skill || editableSkillItem?.skill}
                        label={strings.SkillPerAgentSkillDropdownLabel}
                        onChange={(event, option) => setSkill(option.text)}
                    />
                    <ScoreSlider onChange={data => setScore(data)} initValue={score || editableSkillItem?.score} />
                </div>
            </div>
            <DialogFooter>
                <PrimaryButton onClick={editableSkillItem ? uploadChanges : uploadNewItem} text={strings.SaveRecordLabel} />
                <DefaultButton onClick={onDialogClose} text={strings.CancelRecordLabel} />
            </DialogFooter>
        </Dialog>
    );
};

export default SkillsPerAgentDialog;
