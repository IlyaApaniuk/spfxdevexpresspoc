const config = {
    permissionsApi: {
        baseUrl: "https://sharepointpermissionsresolver.azurewebsites.net",
        getListItems: "api/Permissions/items/get",
        createListItem: "api/Permissions/items/create",
        updateListItem: "api/Permissions/items/update",
        getDriveItems: "api/Permissions/drives/get",
        uploadDriveItem: "api/Permissions/drives/upload"
    },
    lists: {
        AudioFiles: {
            name: "AudioFiles",
            fields: {
                serverRelativeUrl: "ServerRelativeUrl",
                name: "Name",
                timeLastModified: "TimeLastModified",
                graphTimeLastModified: "lastModifiedDateTime",
                graphName: "name",
                graphUrl: "webUrl"
            }
        },
        Businesshours: {
            name: "Businesshours",
            fields: {
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
                skillLookup: "wsp_ucc_spa_skillLookupId",
                agent: "wsp_ucc_spa_Agent",
                expandedAgentName: "wsp_ucc_spa_Agent/wsp_ucc_Agent",
                expandedAgentId: "wsp_ucc_spa_Agent/Id",
                agentLookup: "wsp_ucc_spa_AgentLookupId",
                score: "wsp_ucc_Score"
            }
        }
    }
};

export function getPermissionsApi(path: string): string {
    return `${config.permissionsApi.baseUrl}/${path}`;
}

export default config;
