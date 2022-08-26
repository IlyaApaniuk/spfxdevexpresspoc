// eslint-disable-next-line import/named
import { IDropdownOption } from "@fluentui/react/lib/Dropdown";

import { IFieldValues } from "../../models/skillsPerAgent/IFieldValues";

export default function parseSkillPerAgentFieldsResponse(response: { value: unknown[] }): IFieldValues {
    try {
        const values: IFieldValues = {};

        response?.value?.forEach(field => {
            values[field["InternalName"]] = field["Choices"]?.map(c => ({ key: c, text: c } as IDropdownOption));
        });

        return values;
    } catch (ex) {
        throw ex;
    }
}
