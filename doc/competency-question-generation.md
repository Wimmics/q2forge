### Competency Question Generator

This is the second part of the Q²Forge pieline. It invokes a language model to generates CQs based on various types of information about the KG: name and description, endpoint URL, list of the used ontologies. This information is either taken from the KG configuration (created in the previous step) or manually entered in a form.
The user may also provide any other relevant information, e.g. the abstract of a published article describing the KG.

![Q²Forge - Competency question generation](/public/images/3-cq_generation.png)


The user can select the language model to be used for the generation of the CQs and the number of CQs to be generated. The model is instructed to return each question with an evaluation of its complexity (Basic, Intermediate or Advanced) and a set of tags.
The Enforce Structured Output toggle can be used to compel the model to return the CQs as a JSON-formatted document.

Upon completion of the process, the user may download the output as a JSON document,
and save it in a browser's cookie for reuse in the next step.