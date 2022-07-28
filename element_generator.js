
// Number of significant figures is set to four
const SIG_FIG = 4;

function displayFinalResults() 
{
    const final_results = document.querySelector(".final_results");

    const quality   = ['mass', 'wpercent', 'mpercent', 'molar_mass', 'moles'];
    const display   = ['Mass', 'Weight Percent', 'Mole Percent', 'Molar Mass', 'Moles'];
    const units     = ['g', '%', '%', 'g/mol', 'mol'];

    // const ag_box = document.createElement("section");
    // ag_box.setAttribute("class", "ag_box");

    for (var i = 0 ; i < 2 ; i++) 
    {
        const ag_box = document.createElement("section");
        ag_box.setAttribute("class", "ag_box");

        let func_name = toUpperCase(funcStats[i].name);

        var wpercent_sum = sumMonomerStat(i, "wpercent");
        var mpercent_sum = sumMonomerStat(i, "mpercent");

        const TOLERANCE = 0.001;

        let wpercentsOK = compareFloatValues(wpercent_sum, 100, TOLERANCE);
        let mpercentsOK = compareFloatValues(mpercent_sum, 100, TOLERANCE);
        
        var func_heading;

        if (wpercentsOK && mpercentsOK) {
            func_heading = generateHeading("h2", func_name, "group_heading", "Results")
            console.log("Percent values are OK!");
        } else if (!wpercentsOK) {
            func_heading = generateHeading("h2", func_name, "group_heading", "Results | Bad Weight Percent(s)");
            console.log("Something is wrong with the given or calculated weight percent values.");
            func_heading.style.color = 'red';
        } else if (!mpercentsOK) {
            func_heading = generateHeading("h2", func_name, "group_heading", "Results | Bad Mole Percent(s)");
            console.log("Something is wrong with the given or calculated mole percent values.");
            func_heading.style.color = 'red';
        } else {
            func_heading = generateHeading("h2", func_name, "group_heading", "Results | Bad Percent Values?");
            console.log("Something is wrong with the given or calculated percent values.");
            func_heading.style.color = 'red';
        }

        final_results.append(func_heading);

        const results_table = document.createElement("table");
        results_table.id = "final_results"; 


        // Create table heading for this functional group
        let t_heading_row = document.createElement("tr");

        createTableHeading("Monomer", func_name + '_th');

        for (var w = 0 ; w < display.length ; w++)
        {
            createTableHeading(`${display[w]} (${units[w]})`, `${func_name}_${quality[w]}`);
        }

        function createTableHeading(h_text, desired_id) {
            t_heading = document.createElement("th");
            t_heading.class = 'table_heading';
            t_heading.id = desired_id;
            t_heading.innerText = h_text;

            t_heading_row.appendChild(t_heading);
        }

        results_table.appendChild(t_heading_row);
        
        for (var q = funcStats[i].start, monomer_num = 1 ; q < funcStats[i].end ; q++, monomer_num++) {
            // Create a table row to display the calculated values for this comonomer
            let monomer_row = document.createElement("tr");
            monomer_row.setAttribute("class", "monomer_row");

            let monomer_name_cell = document.createElement("td");
            monomer_name_cell.innerHTML = `${func_name} ${monomer_num}`;
            monomer_row.appendChild(monomer_name_cell);

            for (w = 0 ; w < quality.length ; w++) {
                // Set content to calculated/given values
                let monomer_quality = document.createElement("td");
                let value = monomerStats[q][quality[w]];

                if (value % 1 === 0) {
                    // If the calculated/given value is a whole number, display it as is
                    monomer_quality.innerHTML = monomerStats[q][quality[w]];
                } else if (value < 1 && value > 0) {
                    monomer_quality.innerHTML = toScientificNotation(monomerStats[q][quality[w]]);
                } else {
                    // If the calculated/given value is a rational number, display it with four decimal places
                    monomer_quality.innerHTML = monomerStats[q][quality[w]].toFixed(4);
                }

                // Color monomer value red if something went wrong with their calculation
                if (monomerStats[q][quality[w]] <= 0.0) {
                    monomer_quality.style.color = 'red';
                }

                monomer_row.append(monomer_quality);
            }

            results_table.appendChild(monomer_row);
            
        }

        ag_box.appendChild(results_table);
        final_results.append(ag_box);

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

