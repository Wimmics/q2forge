import { CompetencyQuestion, isCompetencyQuestionArray } from "./competency-question";

export interface DataSetItem {
    question: string;
    query: string;
}

export interface DataSetCookie {
    expirationDate: string;
    dataset: DataSetItem[];
}

// Type Guard to check if an object is a DataSetCookie
export function isDataSetCookie(obj: any): obj is DataSetCookie {
    return (
        typeof obj === "object" &&
        obj !== null &&
        typeof obj.expirationDate === "string" &&
        (
            Array.isArray(obj.dataset) &&
            obj.dataset.every((datasetItem: any) =>
                (typeof datasetItem === "object") &&
                (typeof datasetItem.question === "string") &&
                (typeof datasetItem.query === "string")
            )
        )
    );
}


export interface QuestionsCookie {
    expirationDate: string;
    questions: CompetencyQuestion[];
}


// Type Guard to check if an object is a QuestionsCookie
export function isQuestionsCookie(obj: any): obj is QuestionsCookie {
    return (
        typeof obj === "object" &&
        obj !== null &&
        typeof obj.expirationDate === "string" &&
        (
            Array.isArray(obj.questions) &&
            isCompetencyQuestionArray(obj.questions)
        )
    );
}