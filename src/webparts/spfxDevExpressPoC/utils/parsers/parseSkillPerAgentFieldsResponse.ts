import config from "../../config/config";
import { IFieldValues } from "../../models/skillsPerAgent/IFieldValues";

export default function parseSkillPerAgentFieldsResponse(agents: { value: unknown[] }, skills: { value: unknown[] }, useEscalatedSecurity: boolean): IFieldValues {
    try {
        const values: IFieldValues = {
            agents: agents.value.map(a => ({ key: a[config.lists.Agents.fields.agent], text: a[config.lists.Agents.fields.agent], data: a[useEscalatedSecurity ? "id" : "Id"] })),
            skills: skills.value.map(s => ({ key: s[config.lists.Skills.fields.skill], text: s[config.lists.Skills.fields.skill], data: s[useEscalatedSecurity ? "id" : "Id"] }))
        };

        return values;
    } catch (ex) {
        throw ex;
    }
}
