import { ServiceKey, ServiceScope } from "@microsoft/sp-core-library";
import { ISPHttpClientOptions, SPHttpClient, SPHttpClientResponse } from "@microsoft/sp-http";
import { PageContext } from "@microsoft/sp-page-context";

import { IClientHourItem } from "../models/businessHours/IClientHourItem";
import { IServerHourItem } from "../models/businessHours/IServerHourItem";
import { IRecord } from "../models/records/IRecord";
import parseRecordsResponse from "../utils/parsers/parseRecordsResponse";

export default class SharePointService {
    public static readonly serviceKey = ServiceKey.create<SharePointService>("voice-recorder:UploadService", SharePointService);

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

                return this.updateListItems(listName, serverItem, item.id);
            });

            await Promise.all(promises);

            return true;
        } catch (ex) {
            console.error(ex);

            return false;
        }
    }

    public async getActiveSites<T>(converter?: (response: { value: unknown[] }) => T) {
        try {
            const options: ISPHttpClientOptions = {
                headers: {
                    Accept: "application/json"
                }
            };

            const response = await this.spHttpClient.get(this.getActiveSitesUrlBuilder(), SPHttpClient.configurations.v1, options);

            const items = await response.json();

            return converter ? converter(items) : items;
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

    private updateListItems(listName: string, item: IServerHourItem, itemId: number): Promise<SPHttpClientResponse> {
        const options: ISPHttpClientOptions = {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "If-Match": "*",
                "X-HTTP-Method": "MERGE"
            },
            body: JSON.stringify(item)
        };

        return this.spHttpClient.post(this.updateItemUrlBuilder(listName, itemId), SPHttpClient.configurations.v1, options);
    }

    private updateItemUrlBuilder(listName: string, itemId: number): string {
        return `${this.activeSiteUrl}/_api/Web/Lists/getByTitle('${listName}')/items(${itemId})`;
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
