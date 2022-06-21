
function generateForm () {

    // Check if there are existing forms generated
    if (document.querySelector(".dynamic_form").childElementCount > 0) {
        // Select any dynamic forms that were previously generated
        let form1 = document.getElementById(funcStats[0].name + "_entry");
        let form2 = document.getElementById(funcStats[1].name + "_entry");
        // Remove previous forms to generate a new one
        form1.remove();
        form2.remove();
    }
    
    var br = document.createElement("br");

    for (var i = 0 ; i < 2 ; i++) {
        var form = document.createElement("form");
        form.setAttribute("name", funcStats[i].name + "_entry");    // Should declare a unique form name
        form.setAttribute("id", funcStats[i].name + "_entry");      // Unique id is generated from user inputted name

        var ag_box = document.createElement("section");
        ag_box.setAttribute("class", "ag_box");

        h2 = document.createElement("h2");
        h2.innerHTML = funcStats[i].name;
        h2.className = "dyn_heading";
        form.append(h2);
        // ag_box.append(h2);
        
        // Generate input fields for each monomer to enter mass and/or percent and molar mass. 
        for (var q = 0 ; q < funcStats[i].num ; q++) {
            // Generating 
            h6 = document.createElement("h2");
            h6.innerHTML = funcStats[i].name + " " + (q + 1) + " Monomer";
            h6.className = "ag_box_dyn_heading";

            // Generates label for Mass field
            var mass_label = document.createElement("label");
            mass_label.setAttribute("for", "mass" + funcStats[i].name + "-" + (q + 1));
            mass_label.innerHTML = "Mass";
            // Generates form for entering mass
            var mass = document.createElement("input");
            mass.setAttribute("type", "text");
            mass.setAttribute("name", "mass" + funcStats[i].name + "-" + (q + 1));
            mass.setAttribute("class", "dyn_input_field float");

            // Generates label for Percent field
            var percent_label = document.createElement("label");
            percent_label.setAttribute("for", "percent" + funcStats[i].name + "-" + (q + 1));
            percent_label.innerHTML = "Percent";
            // Generates form for entering percent
            var percent = document.createElement("input");
            percent.setAttribute("type", "text");
            percent.setAttribute("name", "percent" + funcStats[i].name + "-" + (q + 1));
            percent.setAttribute("class", "dyn_input_field float");

            // Generates label for Molar Mass field
            var molar_mass_label = document.createElement("label");
            molar_mass_label.setAttribute("for", "molar_mass" + funcStats[i].name + "-" + (q + 1));
            molar_mass_label.innerHTML = "Molar Mass";
            // Generates form for entering molar mass
            var molar_mass = document.createElement("input");
            molar_mass.setAttribute("type", "text");
            molar_mass.setAttribute("name", "molar_mass" + funcStats[i].name + "-" + (q + 1));
            molar_mass.setAttribute("class", "dyn_input_field float");
            molar_mass.required = true; // Molar mass MUST always be entered for all monomers.

            // Append input fields for comonomer to ag_box
            ag_box.appendChild(br.cloneNode());
            ag_box.appendChild(h6);
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
        var form_attachment = document.querySelector(".dynamic_form");
        // Attach the form to the anchor element
        form_attachment.append(form);
    }
    // Generate the form submission button
    var s = document.createElement("button");
    s.setAttribute("type", "button");
    s.setAttribute("onclick", "getDynamicFormData()");
    s.setAttribute("class", "submit_button");
    s.textContent = "Next";

    form.appendChild(s);

}