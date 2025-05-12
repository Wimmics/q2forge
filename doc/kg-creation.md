### KG Configuration and Pre-processing

This is the first part of the Q²Forge pipeline to create a KG configuration (depicted in the following figure). The user provides minimal information about the target KG: a name, a short name used later on as an identifier, a textual description, a SPARQL endpoint URL, and the namespaces and prefixes to be used in the SPARQL queries and Turtle descriptions.
Optionally, the user may fill in the URL of a SPARQL endpoint hosting the ontologies in case they are not on the same endpoint as the KG itself.

![Q²Forge - KG configuration creation](/public/images/2-kg_configuration.png)

Once created, the configuration is stored on the back-end server. Then, the pre-processing step start. It extracts from the KG various types of information that will be helpful to carry out the downstream text-to-SPARQL task.
This can be ontology classes that are relevant with respect to a NL question, example SPARQL queries, etc.
In our implementation, this step first creates a textual description of the classes from the labels and descriptions available in the ontologies, and computes text embeddings thereof (in the figure steps 2-3).