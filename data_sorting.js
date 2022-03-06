
monomerStatCount = [
{
    mass: 0,
    percent: 0,
    molar_mass: 0,
},
{
    mass: 0,
    percent: 0,
    molar_mass: 0,
},
];

function startDataSorting() {

    for (var i = 0 ; i < 2 ; i++) {

        for (var q = funcStats[i].start ; q < funcStats[i].end ; q++) {
            // Increment Mass Count if it is a positive number
            if (monomerStats[q].mass != 0) {
                monomerStatCount[i].mass += 1;
            }

            // Increment Percent Count if it is a positive number
            if (monomerStats[q].percent != 0) {
                monomerStatCount[i].percent += 1;
            }

            // Increment Molar Mass Count if it is a positive number
            if (monomerStats[q].molar_mass != 0) {
                monomerStatCount[i].molar_mass += 1;
            }
        };
        console.log("Stat Counts for Func Group (" + funcStats[i].name + ") are:\n\t");
        console.log(monomerStatCount[i]);
    } 

}