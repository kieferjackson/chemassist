
// Number of significant figures is set to four
const SIG_FIG = 4;

function displayFinalResults() {
    const final_results = document.querySelector(".final_results");
    var br = document.createElement("br");

    var quality = ['mass', 'wpercent', 'mpercent', 'molar_mass', 'moles'];
    let display = ['Mass', 'Weight Percent', 'Mole Percent', 'Molar Mass', 'Moles'];
    let units = [' g', '%', '%', ' g/mol', ' mol'];

    for (var i = 0 ; i < 2 ; i++) {
        let func_name = toUpperCase(funcStats[i].name);

        const funcDisplay = document.createElement("div");
        funcDisplay.setAttribute("id", funcStats[i].name + "_results"); 

        let ag_box = document.createElement("section");
        ag_box.setAttribute("class", "ag_box");
        
        var wpercent_sum = sumMonomerStat(i, "wpercent");
        var mpercent_sum = sumMonomerStat(i, "mpercent");

        let wpercentsOK = wpercent_sum > 99.9999 && wpercent_sum < 100.0001;
        let mpercentsOK = mpercent_sum > 99.9999 && mpercent_sum < 100.0001;
        
        var h2;

        if (wpercentsOK && mpercentsOK) {
            h2 = generateHeading("h2", func_name, "group_heading", "Results")
            console.log("Percent values are OK!");
        } else if (wpercentsOK) {
            h2 = generateHeading("h2", func_name, "group_heading", "Results | Bad Weight Percent(s)");
            console.log("Something is wrong with the given or calculated weight percent values.");
            h2.style.color = 'red';
        } else if (mpercentsOK) {
            h2 = generateHeading("h2", func_name, "group_heading", "Results | Bad Moles Percent(s)");
            console.log("Something is wrong with the given or calculated mole percent values.");
            h2.style.color = 'red';
        } else {
            h2 = generateHeading("h2", func_name, "group_heading", "Results | Bad Percent Values?");
            console.log("Something is wrong with the given or calculated percent values.");
            h2.style.color = 'red';
        }

        funcDisplay.append(h2);

        for (var q = funcStats[i].start ; q < funcStats[i].end ; q++) {
            let h3 = generateHeading("h3", func_name, "ag_box_dyn_heading", `${q + 1} Monomer:`);
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
                let value = monomerStats[q][quality[w]];
                if (value % 1 === 0) {
                    // If the calculated/given value is a whole number, display it as is
                    monomerDisplay.innerHTML = `${monomerStats[q][quality[w]]}${units[w]}`;
                } else if (value < 1 && value > 0) {
                    monomerDisplay.innerHTML = `${toScientificNotation(monomerStats[q][quality[w]])}${units[w]}`;
                } else {
                    // If the calculated/given value is a rational number, display it with four decimal places
                    monomerDisplay.innerHTML = `${monomerStats[q][quality[w]].toFixed(4)}${units[w]}`;
                }
                
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

function toUpperCase (string_value) {
    if (string_value.length > 1) {
        return string_value.charAt(0).toUpperCase() + string_value.slice(1);
    } else if (string_value.length === 1) {
        return string_value.charAt(0).toUpperCase();
    } else {
        console.log(`Your input value of (${string_value}) is not a string datatype. Its return value will be converted to a string.`);
        return String(string_value);
    }
}

function toScientificNotation (real_number) {
    let it_num = String(real_number);
    var exp_count = -1;
    
    for (var i = 2 ; i < it_num.length ; i++) {
        // Count the number of decimal places before the first significant figures
        while (it_num[i] == 0 && i < it_num.length) {
            exp_count--;
            i++;
        }

        if (it_num[i] != 0) {
            // Initialize scientific notation value
            var sn_number = '';
            for (var q = i ; q < SIG_FIG + i ; q++) {
                if (it_num[q] !== undefined) {
                    sn_number += it_num[q];
                }

                // Add a decimal point ONLY if it is the first iteration of the loop and the next digit is defined
                if (q === i && it_num[q + 1] !== undefined) {
                    sn_number += '.';
                } else if (q === i && it_num[q + 1] === undefined) {
                    // Terminate the number with '.0' if the current digit is undefined
                    sn_number += '.0';
                }
            }

            return `${sn_number} &#215; 10<sup>${exp_count}</sup>`;
        }
    }
}