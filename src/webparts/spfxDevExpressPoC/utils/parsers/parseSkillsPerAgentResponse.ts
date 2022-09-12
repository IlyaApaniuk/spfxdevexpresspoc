import config from "../../config/config";
import { IClientSkillItem } from "../../models/skillsPerAgent/IClientSkillItem";

export function parseSkillsPerAgentResponse(response: { value: unknown[] }): IClientSkillItem[] {
    try {
        return response?.value?.map(s => {
            return {
                skill: { value: s[config.lists.SkillsPerAgent.fields.skill]?.Title, id: s[config.lists.SkillsPerAgent.fields.skill]?.Id },
                score: s[config.lists.SkillsPerAgent.fields.score],
                agent: { value: s[config.lists.SkillsPerAgent.fields.agent]?.wsp_ucc_Agent, id: s[config.lists.SkillsPerAgent.fields.agent]?.Id },
                id: s["Id"]
            } as IClientSkillItem;
        });
    } catch (ex) {
        return [];
    }
}

export function parseSkillsPerAgentResponseUseEscalationSecurity(response: { value: unknown[] }): IClientSkillItem[] {
    try {
        return response?.value?.map(s => {
            return {
                skill: { value: s[config.lists.SkillsPerAgent.fields.skill], id: s[config.lists.SkillsPerAgent.fields.skillLookup] },
                score: s[config.lists.SkillsPerAgent.fields.score],
                agent: { value: s[config.lists.SkillsPerAgent.fields.agent], id: s[config.lists.SkillsPerAgent.fields.agentLookup] },
                id: s["id"]
            } as IClientSkillItem;
        });
    } catch (ex) {
        return [];
    }
}
