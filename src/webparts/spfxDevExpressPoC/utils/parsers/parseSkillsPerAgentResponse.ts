import { IClientSkillItem } from "../../models/skillsPerAgent/IClientSkillItem";

export default function parseSkillsPerAgentResponse(response: { value: unknown[] }): IClientSkillItem[] {
    try {
        return response?.value?.map(s => {
            return {
                skill: s["Skill"],
                score: s["Score"],
                agent: s["Agent"],
                id: s["Id"]
            } as IClientSkillItem;
        });
    } catch (ex) {
        return [];
    }
}
