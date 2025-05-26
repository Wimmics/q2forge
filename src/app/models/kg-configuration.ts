import { Seq2SeqModel } from "./seq2seqmodel";
import { TextEmbeddingModel } from "./text-embedding-model";

export interface KGConfiguration {
    _id?: string;
    kg_full_name: string;
    kg_short_name: string;
    kg_description: string;
    kg_sparql_endpoint_url: string;
    ontologies_sparql_endpoint_url: string;
    properties_qnames_info: string[];
    prefixes: { [key: string]: string };
    ontology_named_graphs: string[];
    excluded_classes_namespaces: string[];
    queryExamples: QueryExample[];
    seq2seq_models?: { [key: string]: Seq2SeqModel };
    text_embedding_models?: { [key: string]: TextEmbeddingModel };
}

export interface QueryExample {
    question: string;
    query: string;
}
