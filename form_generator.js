
function generateForm () {
    var br = document.createElement("br");

    for (var i = 0 ; i < 2 ; i++) {
        let func_name = toUpperCase(funcStats[i].name);

        var form = document.createElement("form");
        form.setAttribute("name", funcStats[i].name + "_entry");    // Should declare a unique form name
        form.setAttribute("id", funcStats[i].name + "_entry");      // Unique id is generated from user inputted name

        let ag_box = document.createElement("section");
        ag_box.setAttribute("class", "ag_box");

        // Generate and append the heading for the whole functional group
        let h2 = generateHeading("h2", func_name, "dyn_heading", "Group");
        form.append(h2);
        
        // Generate input fields for each monomer to enter mass and/or percent and molar mass. 
        for (var q = 0 ; q < funcStats[i].num ; q++) {
            // Generates the heading for each individual comonomer of their respective group
            let h3 = generateHeading("h3", func_name, "ag_box_dyn_heading", `${q + 1} Monomer`);

            // Generates Mass field
            let mass_label = generateLabel("Mass (g)", "mass", func_name, q)
            let mass = generateInputField("mass", func_name, q);

            // Generates Percent field
            let percent_label = generateLabel("Percent (%)", "percent", func_name, q)
            let percent = generateInputField("percent", func_name, q);

            // Generates Molar Mass field
            let molar_mass_label = generateLabel("Molar Mass (g/mol)", "molar_mass", func_name, q)
            let molar_mass = generateInputField("molar_mass", func_name, q);
            molar_mass.required = true; // Molar mass MUST always be entered for all monomers.

            // Append heading and input fields for comonomer to ag_box
            ag_box.appendChild(h3);
            ag_box.appendChild(mass_label);
            ag_box.appendChild(mass);
            ag_box.appendChild(percent_label);
            ag_box.appendChild(percent);
            ag_box.appendChild(molar_mass_label);
            ag_box.appendChild(molar_mass);
            ag_box.appendChild(br.cloneNode());
        }
        // Append finished ag_box to form (this operation will be completed twice. One ag_box for each functional group)
        form.append(ag_box);

        // Set the anchor point for the new form
        let form_attachment = document.querySelector(".dynamic_form");

        // Attach the form to the anchor element
        form_attachment.append(form);
    }
    // Generate the form submission button
    let s = document.createElement("button");
    s.setAttribute("type", "button");
    s.setAttribute("onclick", "getDynamicFormData()");
    s.setAttribute("class", "submit_button");
    s.textContent = "Next";

    // Generate submission button container
    let c = document.createElement("div");
    c.setAttribute("class", "submit_container");
    // Append Submit button to its container
    c.appendChild(s);

    form.appendChild(c);

}

function generateHeading (heading_type, func_name, class_name, plurality) {
    // Generates heading for dynamic form section
    h = document.createElement(heading_type);
    h.innerHTML = `${func_name} ${plurality}`; // NOTE: plurality signifies whether or not the heading is for an individual monomer or the group
    h.className = class_name;

    return h;
}

function generateLabel (display_text, input_type, func_name, q) {
    // Generates label for Input field
    var label = document.createElement("label");
    label.setAttribute("for", `${input_type}${func_name}-${q + 1}`);
    label.innerHTML = display_text;

    return label;
}

function generateInputField (input_type, func_name, q) {
    // Generates form for entering input type's data (mass, percent, or molar mass)
    var field = document.createElement("input");
    field.setAttribute("type", "text");
    field.setAttribute("name", `${input_type}${func_name}-${q + 1}`);
    field.setAttribute("class", "dyn_input_field float");

    return field;
}