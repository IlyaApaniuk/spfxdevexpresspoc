import { ServiceKey, ServiceScope } from "@microsoft/sp-core-library";
import { ISPHttpClientOptions, SPHttpClient, SPHttpClientResponse } from "@microsoft/sp-http";
import { PageContext } from "@microsoft/sp-page-context";

import { IClientHourItem } from "../models/businessHours/IClientHourItem";
import { IServerHourItem } from "../models/businessHours/IServerHourItem";
import { IRecord } from "../models/records/IRecord";
import { ISearchResults } from "../models/search/ISearchResults";
import { IClientSkillItem } from "../models/skillsPerAgent/IClientSkillItem";
import { IServerSkillItem } from "../models/skillsPerAgent/IServerSkillItem";
import parseActiveSitesRespose from "../utils/parsers/parseActiveSitesResponse";
import parseRecordsResponse from "../utils/parsers/parseRecordsResponse";
import parseSearchResults from "../utils/parsers/parseSearchResults";

export default class SharePointService {
    public static readonly serviceKey = ServiceKey.create<SharePointService>("voice-recorder:UploadService", SharePointService);

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

    public async getRecords(libraryName: string): Promise<IRecord[]> {
        try {
            const options: ISPHttpClientOptions = {
                headers: {
                    Accept: "application/json"
                }
            };

            const response = await this.spHttpClient.get(this.getRecordsUrlBuilder(libraryName), SPHttpClient.configurations.v1, options);

            const files = await response.json();

            const records = parseRecordsResponse(files);

            return records;
        } catch (ex) {
            console.error(ex);

            return [];
        }
    }

    public async updateBusinessHours(listName: string, items: IClientHourItem[]): Promise<boolean> {
        try {
            const promises = items.map(item => {
                const serverItem: IServerHourItem = {
                    wsp_ucc_Start: item.startTime,
                    wsp_ucc_End: item.endTime,
                    wsp_ucc_AllDay: item.allDay
                };

                return this.updateListItems(listName, JSON.stringify(serverItem), item.id);
            });

            await Promise.all(promises);

            return true;
        } catch (ex) {
            console.error(ex);

            return false;
        }
    }

    public async updateSkillPerAgent(listName: string, item: IClientSkillItem): Promise<boolean> {
        try {
            const serverItem: IServerSkillItem = {
                Agent: item.agent,
                Skill: item.skill,
                Score: item.score
            };

            await this.updateListItems(listName, JSON.stringify(serverItem), item.id);

            return true;
        } catch (ex) {
            console.error(ex);

            return false;
        }
    }

    public async createSkillPerAgentItem(listName: string, item: IClientSkillItem): Promise<boolean> {
        try {
            const serverItem: IServerSkillItem = {
                Agent: item.agent,
                Skill: item.skill,
                Score: item.score
            };

            await this.createListItem(listName, JSON.stringify(serverItem));

            return true;
        } catch (ex) {
            console.error(ex);

            return false;
        }
    }

    public async getActiveSites(userEmail: string) {
        try {
            const options: ISPHttpClientOptions = {
                headers: {
                    Accept: "application/json"
                }
            };

            let sites: string[] = [];

            if (this.shouldCheckSupervisor) {
                sites = await this.checkSupervisorLists(userEmail);
            }

            const response = await this.spHttpClient.get(this.getActiveSitesUrlBuilder(), SPHttpClient.configurations.v1, options);

            const items = await response.json();

            return parseActiveSitesRespose(items, this.shouldCheckSupervisor ? sites : undefined);
        } catch (ex) {
            throw ex;
        }
    }

    private async checkSupervisorLists(userEmail: string): Promise<string[]> {
        try {
            const options: ISPHttpClientOptions = {
                headers: {
                    Accept: "application/json"
                }
            };

            const sites: string[] = [];
            let url = this.searchSupervisorByEmailQuery(userEmail);

            while (true) {
                const searchResponse = await this.spHttpClient.get(url, SPHttpClient.configurations.v1, options);
                const supervisors: ISearchResults = await searchResponse.json();
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

    public async getListFieldValues<T>(listName: string, fieldNames: string[], converter?: (response: { value: unknown[] }) => T): Promise<T> {
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

    public async getListItems<T>(listName: string, converter?: (response: { value: unknown[] }) => T): Promise<T> {
        try {
            const options: ISPHttpClientOptions = {
                headers: {
                    Accept: "application/json"
                }
            };

            const response = await this.spHttpClient.get(this.getItemsUrlBuilder(listName), SPHttpClient.configurations.v1, options);

            const items = await response.json();

            return converter ? converter(items) : items;
        } catch (ex) {
            throw ex;
        }
    }

    public async uploadFile(listName: string, file: File, name: string): Promise<boolean> {
        try {
            const options: ISPHttpClientOptions = {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                body: file
            };

            await this.spHttpClient.post(this.libraryUploadUrlBuiler(listName, name), SPHttpClient.configurations.v1, options);

            return true;
        } catch (e) {
            console.error(e);

            return false;
        }
    }

    private async createListItem(listName: string, body: string): Promise<SPHttpClientResponse> {
        const options: ISPHttpClientOptions = {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body
        };

        return this.spHttpClient.post(this.getItemsUrlBuilder(listName), SPHttpClient.configurations.v1, options);
    }

    private updateListItems(listName: string, body: string, itemId: number): Promise<SPHttpClientResponse> {
        const options: ISPHttpClientOptions = {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "If-Match": "*",
                "X-HTTP-Method": "MERGE"
            },
            body
        };

        return this.spHttpClient.post(this.updateItemUrlBuilder(listName, itemId), SPHttpClient.configurations.v1, options);
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
}
