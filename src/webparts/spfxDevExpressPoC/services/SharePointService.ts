import { ServiceKey, ServiceScope } from "@microsoft/sp-core-library";
import { ISPHttpClientOptions, SPHttpClient } from "@microsoft/sp-http";
import { PageContext } from "@microsoft/sp-page-context";

import { IRecord } from "../models/IRecord";
import parseRecordsResponse from "../utils/parseRecordsResponse";

export default class SharePointService {
    public static readonly serviceKey = ServiceKey.create<SharePointService>("voice-recorder:UploadService", SharePointService);

    public libraryName: string;

    public siteUrl: string;

    private spHttpClient: SPHttpClient;

    private pageContext: PageContext;

    constructor(serviceScope: ServiceScope) {
        serviceScope.whenFinished(() => {
            this.spHttpClient = serviceScope.consume(SPHttpClient.serviceKey);
            this.pageContext = serviceScope.consume(PageContext.serviceKey);
        });
    }

    public async getRecords(): Promise<IRecord[]> {
        try {
            const options: ISPHttpClientOptions = {
                headers: {
                    Accept: "application/json"
                }
            };

            const response = await this.spHttpClient.get(this.getRecordsUrlBuilder(), SPHttpClient.configurations.v1, options);

            const files = await response.json();

            const records = parseRecordsResponse(files);

            return records;
        } catch (ex) {
            console.error(ex);

            return [];
        }
    }

    public async uploadFile(file: File, name: string): Promise<boolean> {
        try {
            const options: ISPHttpClientOptions = {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                body: file
            };

            await this.spHttpClient.post(this.libraryUploadUrlBuiler(name), SPHttpClient.configurations.v1, options);

            return true;
        } catch (e) {
            console.error(e);

            return false;
        }
    }

    private libraryUploadUrlBuiler(fileName: string): string {
        return `${this.siteUrl}/_api/Web/Lists/getByTitle('${this.libraryName}')/RootFolder/Files/Add(url='${fileName}', overwrite=true)`;
    }

    private getRecordsUrlBuilder(): string {
        const serverRelativeUrl = new window.URL(this.siteUrl).pathname;

        return `${this.siteUrl}/_api/web/GetFolderByServerRelativeUrl('${serverRelativeUrl}/${this.libraryName}')/Files`;
    }
}
