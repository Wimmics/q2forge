export interface Seq2SeqModel {
    configName: string;
    base_url?: string;
    id: string;
    max_retries?: number;
    server_type: string;
    temperature?: number;
    top_p?: number;
}