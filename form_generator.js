
function addElement () {

    var br = document.createElement("br");

    for (var i = 0 ; i < 2 ; i++) {
        var form = document.createElement("form");
        form.setAttribute("name", "func_group_" + i + "_entry");
        
        // Generate input fields for each monomer to enter mass and/or percent and molar mass. 
        for (var q = 0 ; q < window.funcStats[i].num ; q++) {
            // Generates form for entering mass
            var mass = document.createElement("input");
            mass.setAttribute("type", "text");
            mass.setAttribute("name", "mass" + window.funcStats[i].num);

            // Generates form for entering percent
            var percent = document.createElement("input");
            percent.setAttribute("type", "text");
            percent.setAttribute("name", "percent" + window.funcStats[i].num);

            // Generates form for entering molar mass
            var molar_mass = document.createElement("input");
            molar_mass.setAttribute("type", "text");
            molar_mass.setAttribute("name", "molar_mass" + window.funcStats[i].num);
            molar_mass.required = true; // Molar mass MUST always be entered for all monomers.

            // Appending input fields to form; this process will be repeated for each functional group for however many monomers it contains (num)
                form.appendChild(br.cloneNode());
                form.appendChild(mass);
                form.appendChild(percent);
                form.appendChild(molar_mass);
                form.appendChild(br.cloneNode());
        }
    }
    
    var s = document.createElement("input");
    s.setAttribute("type", "submit");
    s.setAttribute("value", "Submit");
    
}