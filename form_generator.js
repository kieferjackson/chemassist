
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

        h2 = document.createElement("h2");
        h2.innerHTML = funcStats[i].name;
        form.append(h2);
        
        // Generate input fields for each monomer to enter mass and/or percent and molar mass. 
        for (var q = 0 ; q < funcStats[i].num ; q++) {
            // Generates form for entering mass
            var mass = document.createElement("input");
            mass.setAttribute("type", "text");
            mass.setAttribute("name", "mass" + funcStats[i].name + "-" + (q + 1));
            mass.setAttribute("class", "dyn_input_field float");

            // Generates form for entering percent
            var percent = document.createElement("input");
            percent.setAttribute("type", "text");
            percent.setAttribute("name", "percent" + funcStats[i].name + "-" + (q + 1));
            percent.setAttribute("class", "dyn_input_field float");

            // Generates form for entering molar mass
            var molar_mass = document.createElement("input");
            molar_mass.setAttribute("type", "text");
            molar_mass.setAttribute("name", "molar_mass" + funcStats[i].name + "-" + (q + 1));
            molar_mass.setAttribute("class", "dyn_input_field float");
            molar_mass.required = true; // Molar mass MUST always be entered for all monomers.

            // Appending input fields to form; this process will be repeated for each functional group for however many monomers it contains (num)
            form.appendChild(br.cloneNode());
            form.appendChild(mass);
            form.appendChild(percent);
            form.appendChild(molar_mass);
            form.appendChild(br.cloneNode());

            var form_attachment = document.querySelector(".dynamic_form");

            form_attachment.append(form);
        }
    }
    
    var s = document.createElement("button");
    s.setAttribute("type", "button");
    s.setAttribute("onclick", "getDynamicFormData()");
    s.textContent = "Submit";

    form.appendChild(s);

}