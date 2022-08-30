import { ServiceKey, ServiceScope } from "@microsoft/sp-core-library";
import { ISPHttpClientOptions, SPHttpClient } from "@microsoft/sp-http";
import { PageContext } from "@microsoft/sp-page-context";

import config from "../config/config";
import { IClientHourItem } from "../models/businessHours/IClientHourItem";
import { IServerHourItem } from "../models/businessHours/IServerHourItem";
import { IRecord } from "../models/records/IRecord";
import { ISearchResults } from "../models/search/ISearchResults";
import { IClientSkillItem } from "../models/skillsPerAgent/IClientSkillItem";
import { IFieldValues } from "../models/skillsPerAgent/IFieldValues";
import { IServerSkillItem } from "../models/skillsPerAgent/IServerSkillItem";
import parseActiveSitesRespose from "../utils/parsers/parseActiveSitesResponse";
import parseBusinessHoursResponse from "../utils/parsers/parseBusinessHoursResponse";
import parseRecordsResponse from "../utils/parsers/parseRecordsResponse";
import parseSearchResults from "../utils/parsers/parseSearchResults";
import parseSkillPerAgentFieldsResponse from "../utils/parsers/parseSkillPerAgentFieldsResponse";
import parseSkillsPerAgentResponse from "../utils/parsers/parseSkillsPerAgentResponse";

export default class SharePointService {
    public static readonly serviceKey = ServiceKey.create<SharePointService>("voice-recorder:UploadService", SharePointService);

    private token: string;

    private readonly tenantId: string = "19e59194-a213-4d26-8ec1-56db95ec718e";

    private readonly tenantName: string = "85458q";

    private readonly clientId: string = "18779fa2-d52e-46b1-b2af-f88162b5875c";

    private readonly clientSecret: string = "oBLq5YXKDJDNrm0Uhx3C6/EkAyVG8AQEXAqdydediqg=";

    public shouldCheckSupervisor: boolean;

    public activeSitesLibraryName: string;

    public activeSitesSiteUrl: string;

    public activeSiteUrl: string;

    private spHttpClient: SPHttpClient;

    private pageContext: PageContext;

    constructor(serviceScope: ServiceScope) {
        serviceScope.whenFinished(() => {
            this.spHttpClient = serviceScope.consume(SPHttpClient.serviceKey);
            this.pageContext = serviceScope.consume(PageContext.serviceKey);
        });
    }

    // <Active sites>

    public async getActiveSites(userEmail: string) {
        try {
            let sites: string[] = [];

            if (this.shouldCheckSupervisor) {
                sites = await this.checkSupervisorLists(userEmail);
            }

            const items: { d: { results: unknown[] } } = await this.getListItems(this.getActiveSitesUrlBuilder());

            return parseActiveSitesRespose(items, this.shouldCheckSupervisor ? sites : undefined);
        } catch (ex) {
            throw ex;
        }
    }

    private async checkSupervisorLists(userEmail: string): Promise<string[]> {
        try {
            const sites: string[] = [];
            let url = this.searchSupervisorByEmailQuery(userEmail);

            while (true) {
                const supervisors = await this.callWrapper<ISearchResults>(url, {
                    method: "GET",
                    headers: {
                        Accept: "application/json"
                    }
                });
                const results = supervisors.PrimaryQueryResult.RelevantResults.Table.Rows;

                sites.push(...parseSearchResults(results));
                if (supervisors["@odata.nextLink"]) {
                    url = supervisors["@odata.nextLink"];
                } else {
                    break;
                }
            }

            return sites;
        } catch (ex) {
            throw ex;
        }
    }

    // </Active sites>

    // <Records>

    public async getRecords(): Promise<IRecord[]> {
        try {
            const records = await this.getListItems<IRecord[]>(this.getRecordsUrlBuilder(config.lists.AudioFiles.name), parseRecordsResponse);

            return records;
        } catch (ex) {
            console.error(ex);

            return [];
        }
    }

    public async uploadRecordFile(file: File, name: string): Promise<boolean> {
        try {
            await this.createListItem(this.libraryUploadUrlBuiler(config.lists.AudioFiles.name, name), file);

            return true;
        } catch (e) {
            console.error(e);

            return false;
        }
    }

    // </Records>

    // <Business hours>

    public async getBusinessHours(): Promise<IClientHourItem[]> {
        try {
            const items = await this.getListItems<IClientHourItem[]>(this.getItemsUrlBuilder(config.lists.Businesshours.name), parseBusinessHoursResponse);

            return items;
        } catch (ex) {
            throw ex;
        }
    }

    public async updateBusinessHours(items: IClientHourItem[]): Promise<boolean> {
        try {
            const promises = items
                .filter(i => i.changed)
                .map(item => {
                    const serverItem: IServerHourItem = {
                        wsp_ucc_Start: item.startTime,
                        wsp_ucc_End: item.endTime,
                        wsp_ucc_AllDay: item.allDay
                    };

                    return this.updateListItems(this.updateItemUrlBuilder(config.lists.Businesshours.name, item.id), JSON.stringify(serverItem));
                });

            await Promise.all(promises);

            return true;
        } catch (ex) {
            console.error(ex);

            return false;
        }
    }

    // </Business hours>

    // <Skills>

    public async getSkillsPerAgentFieldValues(): Promise<IFieldValues> {
        try {
            const agents: { value: unknown[] } = await this.getListItems(`${this.getItemsUrlBuilder(config.lists.Agents.name)}?select=${config.lists.Agents.fields.agent}`);
            const skills: { value: unknown[] } = await this.getListItems(`${this.getItemsUrlBuilder(config.lists.Skills.name)}?select=${config.lists.Skills.fields.skill}`);

            return parseSkillPerAgentFieldsResponse(agents, skills);
        } catch (ex) {
            throw ex;
        }
    }

    public async getSkillPerAgentItems(): Promise<IClientSkillItem[]> {
        try {
            const fields = `?$select=${config.lists.SkillsPerAgent.fields.expandedSkillName},${config.lists.SkillsPerAgent.fields.expandedSkillId},${config.lists.SkillsPerAgent.fields.expandedAgentName},${config.lists.SkillsPerAgent.fields.expandedAgentId},${config.lists.SkillsPerAgent.fields.score},${config.lists.SkillsPerAgent.fields.id}&$expand=${config.lists.SkillsPerAgent.fields.skill},${config.lists.SkillsPerAgent.fields.agent}`;
            const items = await this.getListItems<IClientSkillItem[]>(`${this.getItemsUrlBuilder(config.lists.SkillsPerAgent.name)}${fields}`, parseSkillsPerAgentResponse);

            return items;
        } catch (ex) {
            console.error(ex);

            return [];
        }
    }

    public async createSkillPerAgentItem(item: IClientSkillItem): Promise<boolean> {
        try {
            const serverItem: IServerSkillItem = {
                wsp_ucc_spa_AgentId: item.agent.id,
                wsp_ucc_spa_skillId: item.skill.id,
                wsp_ucc_Score: item.score
            };

            await this.createListItem(this.getItemsUrlBuilder(config.lists.SkillsPerAgent.name), JSON.stringify(serverItem));

            return true;
        } catch (ex) {
            console.error(ex);

            return false;
        }
    }

    public async updateSkillPerAgent(item: IClientSkillItem): Promise<boolean> {
        try {
            const serverItem: IServerSkillItem = {
                wsp_ucc_spa_AgentId: item.agent.id,
                wsp_ucc_spa_skillId: item.skill.id,
                wsp_ucc_Score: item.score
            };

            await this.updateListItems(this.updateItemUrlBuilder(config.lists.SkillsPerAgent.name, item.id), JSON.stringify(serverItem));

            return true;
        } catch (ex) {
            console.error(ex);

            return false;
        }
    }

    // </Skills>

    // <Private methods>

    private async getListItems<T>(url: string, converter?: (response: { value: unknown[] }) => T): Promise<T> {
        try {
            const response = await this.callWrapper<{ value: unknown[] }>(url, {
                method: "GET",
                headers: {
                    Accept: "application/json"
                }
            });

            return converter ? converter(response) : (response as unknown as T);
        } catch (ex) {
            throw ex;
        }
    }

    private async createListItem(url: string, body: BodyInit): Promise<unknown> {
        const response = this.callWrapper(url, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body
        });

        return response;
    }

    private updateListItems(url: string, body: string): Promise<unknown> {
        const response = this.callWrapper(url, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "If-Match": "*",
                "X-HTTP-Method": "MERGE"
            },
            body
        });

        return response;
    }

    private async getListFieldValues<T>(listName: string, fieldNames: string[], converter?: (response: { value: unknown[] }) => T): Promise<T> {
        try {
            const options: ISPHttpClientOptions = {
                headers: {
                    Accept: "application/json"
                }
            };

            const response = await this.spHttpClient.get(this.getFieldsValuesUrlBuilder(listName, fieldNames), SPHttpClient.configurations.v1, options);

            const values = await response.json();

            return converter ? converter(values) : values;
        } catch (ex) {
            throw ex;
        }
    }

    private getFieldsValuesUrlBuilder(listName: string, fieldNames: string[]): string {
        return `${this.activeSiteUrl}/_api/Web/Lists/getByTitle('${listName}')/fields?$filter=${fieldNames.map(name => `EntityPropertyName eq '${name}'`).join(" or ")}`;
    }

    private updateItemUrlBuilder(listName: string, itemId: number): string {
        return `${this.activeSiteUrl}/_api/Web/Lists/getByTitle('${listName}')/items(${itemId})`;
    }

    private searchSupervisorByEmailQuery(userEmail: string): string {
        return `${this.pageContext.site.absoluteUrl}/_api/search/query?querytext='${userEmail}'&SelectProperties='wspuccSupervisorupnOWSTEXT,wspuccSupervisorphoneuriOWSTEXT,wspuccSupervisorOWSTEXT,SPWebUrl'`;
    }

    private getActiveSitesUrlBuilder(): string {
        return `${this.activeSitesSiteUrl}/_api/Web/Lists/getByTitle('${this.activeSitesLibraryName}')/items`;
    }

    private getItemsUrlBuilder(listName: string): string {
        return `${this.activeSiteUrl}/_api/Web/Lists/getByTitle('${listName}')/items`;
    }

    private libraryUploadUrlBuiler(listName: string, fileName: string): string {
        return `${this.activeSitesSiteUrl}/_api/Web/Lists/getByTitle('${listName}')/RootFolder/Files/Add(url='${fileName}', overwrite=true)`;
    }

    private getRecordsUrlBuilder(libraryName: string): string {
        const serverRelativeUrl = new window.URL(this.activeSiteUrl).pathname;

        return `${this.activeSiteUrl}/_api/web/GetFolderByServerRelativeUrl('${serverRelativeUrl}/${libraryName}')/Files`;
    }

    private async getToken(): Promise<void> {
        try {
            const body = new URLSearchParams({
                grant_type: "client_credentials",
                client_id: `${this.clientId}@${this.tenantId}`,
                client_secret: this.clientSecret,
                resource: `00000003-0000-0ff1-ce00-000000000000/${this.tenantName}.sharepoint.com@${this.tenantId}`
            });

            const options: RequestInit = {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body
            };

            const response = await fetch(`https://proxy-file-uploader.herokuapp.com/https://accounts.accesscontrol.windows.net/${this.tenantId}/tokens/OAuth/2`, options);
            const auth = await response.json();

            this.token = auth.access_token;
        } catch (e) {
            console.error(e);

            throw new Error((e as Error).message);
        }
    }

    private async callWrapper<T>(url: string, options: RequestInit): Promise<T> {
        try {
            const response = await fetch(url, { ...options, headers: this.token ? { ...options.headers, Authorization: `Bearer ${this.token}` } : { ...options.headers } });

            let data = await response.json();

            if (!response.ok) {
                try {
                    await this.getToken();

                    const secondTryResponse = await fetch(url, { headers: { ...options.headers, Authorization: `Bearer ${this.token}` } });

                    data = await secondTryResponse.json();
                } catch (e) {
                    throw e;
                }
            }

            return data;
        } catch (e) {
            throw e;
        }
    }

    // </Private methods>
}
