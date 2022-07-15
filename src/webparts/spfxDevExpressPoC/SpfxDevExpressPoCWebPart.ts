import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import { SPComponentLoader } from "@microsoft/sp-loader";
import { IPropertyPaneConfiguration, PropertyPaneTextField } from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
// eslint-disable-next-line import/no-extraneous-dependencies
import { IReadonlyTheme } from "@microsoft/sp-component-base";
// eslint-disable-next-line import/no-unresolved
import * as strings from "SpfxDevExpressPoCWebPartStrings";

import SpfxDevExpressPoC, { ISpfxDevExpressPoCProps } from "./components/SpfxDevExpressPoC";

export interface ISpfxDevExpressPoCWebPartProps {
    headerLabel: string;
}

export default class SpfxDevExpressPoCWebPart extends BaseClientSideWebPart<ISpfxDevExpressPoCWebPartProps> {
    private isDarkTheme = false;

    private environmentMessage = "";

    public render(): void {
        const element: React.ReactElement<ISpfxDevExpressPoCProps> = React.createElement(SpfxDevExpressPoC, {
            headerLabel: this.properties.headerLabel,
            isDarkTheme: this.isDarkTheme,
            environmentMessage: this.environmentMessage,
            hasTeamsContext: !!this.context.sdks.microsoftTeams,
            userDisplayName: this.context.pageContext.user.displayName
        });

        ReactDom.render(element, this.domElement);
    }

    protected onInit(): Promise<void> {
        this.environmentMessage = this.getEnvironmentMessage();
        SPComponentLoader.loadCss("https://cdn3.devexpress.com/jslib/22.1.3/css/dx.material.blue.light.css");

        return super.onInit();
    }

    private getEnvironmentMessage(): string {
        if (!!this.context.sdks.microsoftTeams) {
            // running in Teams
            return this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentTeams : strings.AppTeamsTabEnvironment;
        }

        return this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentSharePoint : strings.AppSharePointEnvironment;
    }

    protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
        if (!currentTheme) {
            return;
        }

        this.isDarkTheme = !!currentTheme.isInverted;
        const { semanticColors } = currentTheme;

        if (semanticColors) {
            this.domElement.style.setProperty("--bodyText", semanticColors.bodyText || null);
            this.domElement.style.setProperty("--link", semanticColors.link || null);
            this.domElement.style.setProperty("--linkHovered", semanticColors.linkHovered || null);
        }
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
