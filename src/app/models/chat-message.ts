export interface ChatMessage {
    sender: string;
    content: string;
    eventType: string;
    queryToRefine?: string;
    questionOfTheQueryToRefine?: string;
}

export interface SPARQLChatMessages{
    _id: string;
    messages: ChatMessage[];
    createdAt: Date;
}