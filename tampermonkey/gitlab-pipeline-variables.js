// ==UserScript==
// @name         Gitlab tools
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Gitlab variables
// @author       Sergio Soldado
// @match        http://*gitlab*/*
// @require http://code.jquery.com/jquery-3.6.0.min.js
// ==/UserScript==

// Gitlab API token.
const gitlab_api_token = 'YOUR TOKEN STRING HERE'

/**
 * Get project id from the page.
 * @returns {*|jQuery}
 */
function get_project_id() {
    return $('#search_project_id').prop('value')
}

/**
 * Get pipeline id from the page.
 * @returns Pipeline id string or null if not found
 */
function get_pipeline_id() {
    const pat = /(?<=Pipeline #)\d+/
    const content = $('body').html()
    const res = pat.exec(content)
    if (res) {
        return res[0]
    }
    try {
        return $(".js-pipeline-path")[0].text.substring(1)
    } catch (err) {
    }
    return null
}

function poll_pipeline_id() {
    const project_id = get_project_id()
    const pipeline_id = get_pipeline_id()

    if (!project_id || !pipeline_id) {
        setTimeout(function () {
            poll_pipeline_id()
        }, 2000)
        return
    }

    const url = `/api/v4/projects/${project_id}/pipelines/${pipeline_id}/variables?private_token=${gitlab_api_token}`
    $.get(url, function (data) {
        data.forEach(d => {
            if (document.getElementsByClassName('info-well').length > 0) {
                document.getElementsByClassName('info-well')[0].innerHTML += `<div class="well-segment">${d.key}: ${d.value}</div>`
            } else {
                document.getElementsByClassName('blocks-container')[0].innerHTML += `<div class="well-segment">${d.key}: ${d.value}</div>`
            }
        })
    });
}

$(document).ready(function () {
    poll_pipeline_id()
});
