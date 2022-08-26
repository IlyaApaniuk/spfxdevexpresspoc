export interface ISearchResults {
    "@odata.nextLink": string;
    PrimaryQueryResult: IPrimaryQueryResult;
}

export interface IPrimaryQueryResult {
    RelevantResults: IRelevantResults;
}

export interface IRelevantResults {
    Table: ITable;
}

export interface ITable {
    Rows: IRow[];
}

export interface IRow {
    Cells: ICell[];
}

export interface ICell {
    Key: string;
    Value: string;
    ValueType: string;
}
