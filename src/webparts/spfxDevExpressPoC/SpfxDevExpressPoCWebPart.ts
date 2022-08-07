import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import { IPropertyPaneConfiguration, PropertyPaneTextField } from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
// eslint-disable-next-line import/no-unresolved
import * as strings from "SpfxDevExpressPoCWebPartStrings";
import { SPComponentLoader } from "@microsoft/sp-loader";
import { PropertyFieldSitePicker, IPropertyFieldSite } from "@pnp/spfx-property-controls/lib/PropertyFieldSitePicker";

import SpfxDevExpressPoC, { ISpfxDevExpressPoCProps } from "./components/SpfxDevExpressPoC";
import SharePointService from "./services/SharePointService";

export interface ISpfxDevExpressPoCWebPartProps {
    libraryName: string;
    sourceSites: IPropertyFieldSite[];
}

export default class SpfxDevExpressPoCWebPart extends BaseClientSideWebPart<ISpfxDevExpressPoCWebPartProps> {
    private uploadService: SharePointService;

    public render(): void {
        const element: React.ReactElement<ISpfxDevExpressPoCProps> = React.createElement(SpfxDevExpressPoC, {
            libraryName: this.properties.libraryName,
            sourceSite: this.properties.sourceSites?.[0]?.url,
            uploadService: this.uploadService
        });

        ReactDom.render(element, this.domElement);
    }

    protected onInit(): Promise<void> {
        this.uploadService = this.context.serviceScope.consume(SharePointService.serviceKey);
        SPComponentLoader.loadCss("https://cdn3.devexpress.com/jslib/22.1.3/css/dx.material.blue.light.css");

        return super.onInit();
    }

    protected onDispose(): void {
        ReactDom.unmountComponentAtNode(this.domElement);
    }

    protected get dataVersion(): Version {
        return Version.parse("1.0");
    }

    protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
        return {
            pages: [
                {
                    header: {
                        description: strings.PropertyPaneDescription
                    },
                    groups: [
                        {
                            groupName: strings.SettingsGroupName,
                            groupFields: [
                                PropertyFieldSitePicker("sourceSites", {
                                    label: strings.PickSourceSiteLabel,
                                    initialSites: this.properties.sourceSites,
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    context: this.context as any,
                                    deferredValidationTime: 500,
                                    multiSelect: false,
                                    onPropertyChange: this.onPropertyPaneFieldChanged,
                                    properties: this.properties,
                                    key: "sitesFieldId"
                                }),
                                PropertyPaneTextField("libraryName", {
                                    label: strings.SourceLibraryNameLable,
                                    value: this.properties.libraryName
                                })
                            ]
                        }
                    ]
                }
            ]
        };
    }
}
