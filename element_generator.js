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

    for (var i = 0 ; i < 2 ; i++) {

        const funcDisplay = document.createElement("div");
        funcDisplay.setAttribute("id", funcStats[i].name + "_results"); 

        let h2 = document.createElement("h2");

        //var percentsOK = sumMonomerStat(i, "wpercent") === 100 && sumMonomerStat(i, "mpercent") === 100;

        let heading_content = `${funcStats[i].name}:`;
        h2.innerHTML = heading_content; // remove this if the temporarily commented code is returned

        /* TEMPORARILY COMMENTED OUT
        if (percentsOK === true) {
            heading_content += ` | Percents OK`;
            h2.innerHTML = heading_content;
            h2.style.color = 'green';
        } else {
            heading_content += ` | Percents Bad:`;
            h2.innerHTML = heading_content;
            h2.style.color = 'red';
        }
        */

        funcDisplay.append(h2);

        for (var q = funcStats[i].start ; q < funcStats[i].end ; q++) {
            for (w = 0 ; w < 5 ; w++) {
                let content = `${quality[w]}: ${monomerStats[q][quality[w]]}`;
                monomerDisplay = document.createElement("div");

                monomerDisplay.innerHTML = content;
                
                funcDisplay.append(monomerDisplay);

                // Color monomer value red if something went wrong with their calculation
                if (monomerStats[q][quality[w]] <= 0.0) {
                    monomerDisplay.style.color = 'red';
                }
            }
            
            funcDisplay.appendChild(br.cloneNode());

        }

        final_results.append(funcDisplay);

    }

}