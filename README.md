# Q²Forge

This project provides an end-to-end pipeline to generate a dataset of (question, SPARQL query) pairs for a given Knowledge Graph (KG). The backend (Gen²KGBot) can be found at [this repo](https://github.com/Wimmics/gen2kgbot).


## Features 

It provides the following feature:
- KG Configuration and Pre-processing ([read more](./doc/kg-creation.md)).
- Competency question generator ([read more](./doc/competency-question-generation.md)).
- SPARQL query generator ([read more](./doc/sparql-query-generation.md)).
- SPARQL query refinement ([read more](./doc/sparql-query-refinement.md)).

The following diagram shows the pipeline and how Q²Forge integrates with other systems

![Q²Forge pipeline](/public/images/1-pipeline.png)


## Demo video ⏯️

### Teaser

[![Q²Forge teaser video](/public/images/teaser_q2forge_thumbnail.png)](https://youtu.be/E9rgCZzWH4k)


### Full tutorial

[![Q²Forge full video](/public/images/q2forge_thumbnail.png)](https://youtu.be/I3w-jmZRJII)

### Conference Presentation (K-CAP 2025)

[![Q²Forge K-CAP Presentation](/public/images/q2forge_kcap_presentation.png)](https://youtu.be/RZbSCbMr1es)


## Run locally

To run locally you need to:

1) **Install the dependencies**: run the command:

```bash
npm run i
```

2) **Start a local development server**: run the command:

```bash
ng serve
```
3) **Visualise the result**: once the server is running, open your browser and navigate to <http://localhost:4200/>.


## Build & Deploy

To build the project run the command:

```bash
npm run dc
```

This will run the following command:
```bash
ng build --base-href=/q2forge/ --deploy-url=/q2forge/ --configuration=production
```

which will compile the project and store the build artifacts in the `dist/q2forge` directory.

## License

See the [LICENSE file](./LICENSE).

## Cite this work

Yousouf Taghzouti, Franck Michel, Tao Jiang, Louis Felix Nothias, and Fabien Gandon. 2025. Q²Forge: Minting Competency Questions and SPARQL Queries for Question-Answering Over Knowledge Graphs. In Proceedings of the 13th Knowledge Capture Conference 2025 (K-CAP '25). Association for Computing Machinery, New York, NY, USA, 74–81. https://doi.org/10.1145/3731443.3771350


<details>
<summary>See BibTex</summary>
@inproceedings{10.1145/3731443.3771350,
author = {Taghzouti, Yousouf and Michel, Franck and Jiang, Tao and Nothias, Louis Felix and Gandon, Fabien},
title = {Q²Forge: Minting Competency Questions and SPARQL Queries for Question-Answering Over Knowledge Graphs},
year = {2025},
isbn = {9798400718670},
publisher = {Association for Computing Machinery},
address = {New York, NY, USA},
url = {https://doi.org/10.1145/3731443.3771350},
doi = {10.1145/3731443.3771350},
booktitle = {Proceedings of the 13th Knowledge Capture Conference 2025},
pages = {74–81},
numpages = {8},
series = {K-CAP '25}
}
</details>