export interface CompetencyQuestion {
    question: string;
    tags?: string[];
    complexity?: string;
}

// Type Guard to check if an object is a CompetencyQuestion
export function isCompetencyQuestion(obj: any): obj is CompetencyQuestion {
    return (
        typeof obj === "object" &&
        obj !== null &&
        typeof obj.question === "string" &&
        (obj.tags === undefined || (Array.isArray(obj.tags) && obj.tags.every((tag: any) => typeof tag === "string"))) &&
        (obj.complexity === undefined || typeof obj.complexity === "string")
    );
}
// Type Guard to check if an object is an array of CompetencyQuestion
export function isCompetencyQuestionArray(obj: any): obj is CompetencyQuestion[] {
    return Array.isArray(obj) && obj.every(isCompetencyQuestion);
}