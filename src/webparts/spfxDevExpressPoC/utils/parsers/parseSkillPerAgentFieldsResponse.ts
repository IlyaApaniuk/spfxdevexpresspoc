import { IFieldValues } from "../../models/skillsPerAgent/IFieldValues";

export default function parseSkillPerAgentFieldsResponse(agents: { value: unknown[] }, skills: { value: unknown[] }): IFieldValues {
    try {
        const values: IFieldValues = {
            agents: agents.value.map(a => ({ key: a["wsp_ucc_Agent"], text: a["wsp_ucc_Agent"], data: a["Id"] })),
            skills: skills.value.map(s => ({ key: s["Title"], text: s["Title"], data: s["Id"] }))
        };

        return values;
    } catch (ex) {
        throw ex;
    }
}
