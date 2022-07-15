import * as React from "react";
import DataGrid, { Column, Grouping, GroupPanel, Pager, Paging, SearchPanel } from "devextreme-react/data-grid";
import ODataStore from "devextreme/data/odata/store";

import styles from "./SpfxDevExpressPoC.module.scss";
import DiscountCell from "./DiscountCell/DiscountCell";

export interface ISpfxDevExpressPoCProps {
    headerLabel: string;
    isDarkTheme: boolean;
    environmentMessage: string;
    hasTeamsContext: boolean;
    userDisplayName: string;
}

const pageSizes = [10, 25, 50, 100];

const dataSourceOptions = {
    store: new ODataStore({
        url: "https://js.devexpress.com/Demos/SalesViewer/odata/DaySaleDtoes",
        key: "Id",
        beforeSend(request) {
            request.params.startDate = "2020-05-10";
            request.params.endDate = "2020-05-15";
        }
    })
};

const SpfxDevExpressPoC: React.FC<ISpfxDevExpressPoCProps> = () => {
    const [collapsed, setCollapsed] = React.useState<boolean>(false);

    // temp any
    const onContentReady = (event: any) => {
        if (!collapsed) {
            event.component.expandRow(["EnviroCare"]);
            setCollapsed(true);
        }
    };

    return (
        <div className={styles.spfxDevExpressWrapper}>
            <DataGrid dataSource={dataSourceOptions} allowColumnReordering={true} rowAlternationEnabled={true} showBorders={true} onContentReady={onContentReady}>
                <GroupPanel visible={true} />
                <SearchPanel visible={true} highlightCaseSensitive={true} />
                <Grouping autoExpandAll={false} />

                <Column dataField="Product" groupIndex={0} />
                <Column dataField="Amount" caption="Sale Amount" dataType="number" format="currency" alignment="right" />
                <Column
                    dataField="Discount"
                    caption="Discount %"
                    dataType="number"
                    format="percent"
                    alignment="right"
                    allowGrouping={false}
                    cellRender={DiscountCell}
                    cssClass="bullet"
                />
                <Column dataField="SaleDate" dataType="date" />
                <Column dataField="Region" dataType="string" />
                <Column dataField="Sector" dataType="string" />
                <Column dataField="Channel" dataType="string" />
                <Column dataField="Customer" dataType="string" width={150} />

                <Pager allowedPageSizes={pageSizes} showPageSizeSelector={true} />
                <Paging defaultPageSize={10} />
            </DataGrid>
        </div>
    );
};

export default SpfxDevExpressPoC;
