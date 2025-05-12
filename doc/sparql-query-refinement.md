### SPARQL Query Refinement

This is the fourth part of the Q²Forge pipeline, the user can incrementally refine a SPARQL query so that it reflects precisely the question.


1. First, the query is displayed in a SPARQL editor that highlights potential syntactic errors and can be used to submit the query to the endpoint.
2. To help the user understand the query, Q²Forge can extract the qualified (prefixed) names (QNs) and fully qualified names (FQNs) from the query and get their labels and descriptions.
    For instance, the label of <http://purl.obolibrary.org/obo/CHEBI_53289> is *donepezil*, and its description is *a racemate comprising equimolar amounts of (R)- and (S)-donepezil (...)*.
3. Then the LLM is asked to judge whether the query matches the given question. It is requested to provide a grade between 0 and 10 along with explanations justifying the grade.

The user may then iterate as needed: amend the query based on the grade and insights from the model, test it, have the model judge it, etc.
Once a satisfying query is reached, the user can add the question-query pair to a dataset and export it in a variety of formats, catering to different use cases.

![Q²Forge - SPARQL query refinement](/public//images/5-query_refinement.png)
