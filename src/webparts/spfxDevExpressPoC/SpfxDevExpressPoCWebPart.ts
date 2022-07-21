import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import { IPropertyPaneConfiguration, PropertyPaneTextField } from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
// eslint-disable-next-line import/no-unresolved
import * as strings from "SpfxDevExpressPoCWebPartStrings";
import { SPComponentLoader } from "@microsoft/sp-loader";

import SpfxDevExpressPoC, { ISpfxDevExpressPoCProps } from "./components/SpfxDevExpressPoC";
import SharePointService from "./services/SharePointService";

export interface ISpfxDevExpressPoCWebPartProps {
    headerLabel: string;
}

export default class SpfxDevExpressPoCWebPart extends BaseClientSideWebPart<ISpfxDevExpressPoCWebPartProps> {
    private uploadService: SharePointService;

    public render(): void {
        const element: React.ReactElement<ISpfxDevExpressPoCProps> = React.createElement(SpfxDevExpressPoC, {
            headerLabel: this.properties.headerLabel,
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
                                PropertyPaneTextField("headerLabel", {
                                    label: strings.HeaderLabel
                                })
                            ]
                        }
                    ]
                }
            ]
        };
    }
}
