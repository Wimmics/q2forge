import { SPARQLChatMessages } from "./chat-message"

export interface User {
    _id?: string
    username: string
    disabled?: boolean
    active_config_id?: string
    sparql_chats?: SPARQLChatMessages[]
}