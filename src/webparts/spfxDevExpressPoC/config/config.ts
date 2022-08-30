export default {
    lists: {
        AudioFiles: {
            name: "AudioFiles",
            fields: {
                ServerRelativeUrl: "ServerRelativeUrl",
                Name: "Name",
                TimeLastModified: "TimeLastModified"
            }
        },
        Businesshours: {
            name: "Businesshours",
            fields: {
                Id: "ID",
                day: "wsp_ucc_day",
                start: "wsp_ucc_Start",
                end: "wsp_ucc_End",
                allDay: "wsp_ucc_AllDay"
            }
        },
        Skills: {
            name: "Skills",
            fields: {
                skill: "Title"
            }
        },
        Agents: {
            name: "Agents",
            fields: {
                agent: "wsp_ucc_Agent"
            }
        },
        SkillsPerAgent: {
            name: "SkillsPerAgent",
            fields: {
                skill: "wsp_ucc_spa_skill",
                expandedSkillName: "wsp_ucc_spa_skill/Title",
                expandedSkillId: "wsp_ucc_spa_skill/Id",
                agent: "wsp_ucc_spa_Agent",
                expandedAgentName: "wsp_ucc_spa_Agent/wsp_ucc_Agent",
                expandedAgentId: "wsp_ucc_spa_Agent/Id",
                score: "wsp_ucc_Score",
                id: "Id"
            }
        }
    }
};
