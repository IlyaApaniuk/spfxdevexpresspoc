export interface IClientSkillItem {
    skill: ILookupField;
    score: number;
    agent: ILookupField;
    id: number;
}

export interface ILookupField {
    value: string;
    id: number;
}
