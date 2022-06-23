
function displayFinalResults() {
    
    // Check if there are existing elements generated
    if (document.querySelector(".final_results").childElementCount > 0) {
        // Select any dynamic forms that were previously generated
        let display_elements1 = document.getElementById(funcStats[0].name + "_results");
        let display_elements2 = document.getElementById(funcStats[1].name + "_results");
        // Remove previous elements to generate new ones
        display_elements1.remove();
        display_elements2.remove();
    }

    const final_results = document.querySelector(".final_results");
    var br = document.createElement("br");

    var quality = ['mass', 'wpercent', 'mpercent', 'molar_mass', 'moles'];
    let display = ['Mass', 'Weight Percent', 'Mole Percent', 'Molar Mass', 'Moles'];
    let units = [' g', '%', '%', ' g/mol', ' mol'];

    for (var i = 0 ; i < 2 ; i++) {

        const funcDisplay = document.createElement("div");
        funcDisplay.setAttribute("id", funcStats[i].name + "_results"); 

        let ag_box = document.createElement("section");
        ag_box.setAttribute("class", "ag_box");

        var h2;
        var percentsOK = sumMonomerStat(i, "wpercent") === 100 && sumMonomerStat(i, "mpercent") === 100;

        if (percentsOK) {
            h2 = generateHeading("h2", funcStats[i].name, "group_heading", "Results")
            console.log("Percent values are OK!");
        } else {
            h2 = generateHeading("h2", funcStats[i].name, "group_heading", "Results | Bad Percent Values?");
            console.log("Something is wrong with the given or calculated percent values.");
            h2.style.color = 'red';
        }

        funcDisplay.append(h2);

        for (var q = funcStats[i].start ; q < funcStats[i].end ; q++) {
            let h3 = generateHeading("h3", funcStats[i].name, "ag_box_dyn_heading", `${q + 1} Monomer:`);
            ag_box.appendChild(h3);

            // Create a box to display the calculated values
            display_box = document.createElement("section");
            display_box.setAttribute("class", "display_box");

            for (w = 0 ; w < 5 ; w++) {
                // Create custom label for calculated value display
                let result_label = document.createElement("div");
                result_label.setAttribute("class", "results_label");
                result_label.innerHTML = `${display[w]}: `;

                // Set content to calculated/given values
                let monomerDisplay = document.createElement("div");
                monomerDisplay.innerHTML = `${monomerStats[q][quality[w]]}${units[w]}`;
                
                display_box.append(result_label);
                display_box.append(monomerDisplay);

                // Color monomer value red if something went wrong with their calculation
                if (monomerStats[q][quality[w]] <= 0.0) {
                    monomerDisplay.style.color = 'red';
                }
            }

            ag_box.appendChild(display_box);
            // funcDisplay.appendChild(br.cloneNode());
            
        }

        funcDisplay.appendChild(ag_box);
        final_results.append(funcDisplay);

    }

}