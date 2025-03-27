export interface ChatMessage {
    sender: string;
    content: string;
    eventType: string;
    queryToRefine?: string;
    questionOfTheQueryToRefine?: string;
}