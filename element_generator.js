function displayFinalResults() {
    console.log("Hello, this is the displayFinalResults function.");

    const final_results = document.querySelector(".final_results");
    var br = document.createElement("br");

    var quality = ['mass', 'wpercent', 'mpercent', 'molar_mass', 'moles'];

    for (var i = 0 ; i < 2 ; i++) {
        let h2 = document.createElement("h2");
        let heading_content = `${funcStats[i].name}:`;
        h2.innerHTML = heading_content;
        final_results.append(h2);

        for (var q = funcStats[i].start ; q < funcStats[i].end ; q++) {
            for (w = 0 ; w < 5 ; w++) {
                let content = `${quality[w]}: ${monomerStats[q][quality[w]]}`;
                monomerDisplay = document.createElement("div");

                monomerDisplay.innerHTML = content;
                
                final_results.append(monomerDisplay);

                // Color monomer value red if something went wrong with their calculation
                if (monomerStats[q][quality[w]] <= 0.0) {
                    monomerDisplay.style.color = 'red';
                }
            }
            
            final_results.appendChild(br.cloneNode());;

        }
    }

}