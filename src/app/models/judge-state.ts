export interface JudgeState {
    judge_status: string | string[]
    generated_answer: string
    query?: string
    query_qnames?: string[]
    qnames_info?: string[]
    judging_grade?: number
    judgement?: string
    query_regeneration_prompt?: string
}


// Custom toString
export function toStringMarkdown(obj: JudgeState): string {
    let formated_result = "**====== Judge State =====**\n\n";
    if (Array.isArray(obj.judge_status)) {
        formated_result += "**Judge Status:** " + obj.judge_status[0] + "\n\n";
    } else {
        formated_result += "**Judge Status:** " + obj.judge_status + "\n\n";
    }
    formated_result += "**Generated Answer:** \n" + obj.generated_answer + "\n\n";

    if (obj.query) {
        formated_result += "**Query:** \n" + "```sparql \n " + obj.query + "\n ``` \n\n";
    }

    if (obj.query_qnames) {
        if (obj.qnames_info) {

            formated_result += `<table><tr><th style="border-bottom: 1px solid black">Query QNames</th><th style="border-bottom: 1px solid black">QNames Info</th></tr>`;
            for (let i = 0; i < obj.query_qnames.length; i++) {
                let qnames_infos = obj.qnames_info[i].split("\n")
                formated_result += `<tr>
                    <td style="border-bottom: 1px solid black" rowspan="${obj.qnames_info[i].split("\n").length}">${obj.query_qnames[i]}</td>`
                if (qnames_infos.length > 0) {
                    formated_result += `${`<td style="border-bottom: 1px solid black">${qnames_infos[0]}</td>`}`
                }
                formated_result += `</tr>`;

                for (let i = 1; i < qnames_infos.length; i++) {
                    formated_result += `<tr>
                        ${`<td style="border-bottom: 1px solid black">${qnames_infos[i]}</td>`}
                    </tr>`;
                }
            }
            formated_result += `</table>\n\n`;

        }
        else {
            formated_result += "**Query QNames:** \n\n " + obj.query_qnames.map(item => "* `" + item + "`").join("\n") + "\n\n";
        }
    }

    if (obj.judging_grade) {
        formated_result += "**Judging Grade:** \n " + obj.judging_grade + "\n\n";
    }

    if (obj.judgement) {
        formated_result += "**Judgement:** \n " + obj.judgement + "\n\n";
    }

    if (obj.query_regeneration_prompt) {
        formated_result += "**Query Regeneration Prompt:** \n " + obj.query_regeneration_prompt + "\n\n";
    }

    return formated_result;
}