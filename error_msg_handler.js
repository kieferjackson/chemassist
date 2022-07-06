
function generateErrorMsg (form_id, error_text) {
    const form = document.querySelector(`#${form_id}`);

    let error_container = document.createElement("section");
    error_container.setAttribute("class", "error_container");

    let error_msg = document.createElement("div");
    error_msg.innerHTML = error_text;
    error_msg.setAttribute("class", "error_msg");

    error_container.appendChild(error_msg);

    form.appendChild(error_container);
}

function clearErrors () {
    let num_errors = document.querySelectorAll(".error_container").length;
    // Check if there are existing elements generated
    if (num_errors > 0) {
        let errors_to_remove = document.getElementsByClassName("error_container");
        // debugger;
        for (var i = num_errors - 1 ; i > 0 ; i--) {
            // debugger;
            errors_to_remove[i].remove();
        }
    }
}