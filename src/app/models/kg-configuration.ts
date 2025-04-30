export interface KGConfiguration {
    kg_full_name: string;
    kg_short_name: string;
    kg_description: string;
    kg_sparql_endpoint_url: string;
    ontologies_sparql_endpoint_url: string;
    properties_qnames_info: string[];
    prefixes: { [key: string]: string };
    ontology_named_graphs: string[];
    max_similar_classes: number;
    expand_similar_classes: boolean;
    class_context_format: string;
    excluded_classes_namespaces: string[];
    queryExamples: QueryExample[];
}

export interface QueryExample {
    question: string;
    query: string;
}
