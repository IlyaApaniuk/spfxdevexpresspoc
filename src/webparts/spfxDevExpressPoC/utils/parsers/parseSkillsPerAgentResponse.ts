import { IClientSkillItem } from "../../models/skillsPerAgent/IClientSkillItem";

export default function parseSkillsPerAgentResponse(response: { value: unknown[] }): IClientSkillItem[] {
    try {
        return response?.value?.map(s => {
            return {
                skill: { value: s["wsp_ucc_spa_skill"]?.Title, id: s["wsp_ucc_spa_skill"]?.Id },
                score: s["wsp_ucc_Score"],
                agent: { value: s["wsp_ucc_spa_Agent"]?.wsp_ucc_Agent, id: s["wsp_ucc_spa_Agent"]?.Id },
                id: s["Id"]
            } as IClientSkillItem;
        });
    } catch (ex) {
        return [];
    }
}
