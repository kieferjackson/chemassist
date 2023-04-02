# Calculation Routes

## Reference Routes
### All Mass Route
This is the simplest calculation route because it can perform each calculation to find weight percents, mole
percents, and moles through fairly simple methods. Any already entered percent values (which would go beyond the minimum required
user input) are ignored and recalculated. 

### Zipper Routes
The conditions of this calculation route require that the number of comonomers for a functional group are greater
than or equal to 2 because the calculations require that comonomers either have mass or percent values given. It is a unique case
because the percents are added up, and the difference between 100 and those summed up percents gives the "partial mass percent".
The partial mass percent then allows for their particular percent values to be found by using the proportions between masses.

### Excess Info Routes
The conditions of this route are designed so that calculations are performed using one's comonomer with both a mass
and percent given as a 'reference comonomer', where the ratio between mass and percent can be used for other comonomers with only percent given. It is the most general calculation route for the reference group because its requirements are less strict than others and it can have a wide range of possible inputs. However, it also has a greater chance of error, specifically with the ratios between mass and given percents. As such, this calculation route attempts to account for possible user error and should cancel calculations if ever there is a conflict between given and calculated values.

### Tetris Routes
A reference comonomer is required for the tetris route to be possible. As well, there must be an unknown comonomer and every remaining comonomer must be partially known. The reference comonomer is used in order to obtain the ratio between mass/mole and weight/mole percents respectively, so that all remaining partially known comonomer can have their undetermined value calculated using the calculated ratio. In the end, the only remaining comonomer is the unknown, which can be found since all other values have already been determined.

*NOTE*:   The 'tetris route' was originally its own route, but because the calculations between the two routes differed so little, they were consolidated into a single route. However, there is still distinction made between the two because the 'tetris route' is a minimal information route like the all mass or zipper routes.

## Complimentary Routes
### All Percent Routes
Complimentary calculations do not require mass to be given for calculations to be possible. In fact, it is preferred that only percents are given because their calculations are based around the the mole sum calculated from the reference groups mole sum multiplied by the molar equivalents of the complimentary group. This route is also not separated into 'All Mole Percent' and 'All Weight Percent' because only minor branching is required within the route to accomodate both percents.

#### All Weight Percent Route
Weight percent calculations vary greatly from mole percent because complimentary calculations are partly based and reliant on the reference groups mole sum. In the case of mole percents, the conversion of values is simple since they are all in terms of moles. However, this is not the case for the weight percent.

In essence, the goal is to convert the given weight percent values to mole percents by bringing their percent values (which are in terms of weight) in terms of moles using their respective molar mass (its terms are mass / moles). We take each of those proportions, sum all them together, then divide each of them by the total sum and multiply that result by 100 to get the percent value.

It is worth noting that these calculations are only applicable to complimentary groups with more than 1 comonomer because their percents can only be 100. As well, the calculations work on the assumption that the total mass is 100, so that the given percentage values are the same as the pseudo-masses* calculated.

- 40% -> 40 pseudo-g; 40 p-g / molar_mass = -- pseudo-mol

### Given Mass Route
Given Mass Route - Mass being given for a complimentary group is unconventional, but it is still possible provided that the mole values of the given masses do not exceed the calculated mole sum of the complimentary group. Essentially, the mass values are converted to moles, then their moles are divided by the mole sum to find mole percents for all but one of the comonomers. The final comonomer's mole percent is found by finding the difference between 100 and the partial mole percent sum.  With this unknown comonomer's mole percent found, its moles are found by multiplying the percent by the total sum, then converted to mass. From there, weights percents are found by summing all the mass values and dividing each one by it.

In this case, no percents are given and only `n - 1` masses are given.  If all the masses or any percents were given, then a separate calculation route is required to consider the possible user error.

### Zipper Routes
The conditions of this route are similar to the reference groups Zipper Route (refer to that above), but where they differ is that the complimentary group requires that one of the comonomers is unknown. An unknown is required so that there is 'wiggle room' for complimentary calculations since they are based on the reference group, it is also limited by it as well.  

Different routes are required for weight and mole percents because their calculations diverge so greatly, that they cannot be part of the same route with minor branching as is the case for some other routes.

### Excess Info Routes
For both reference and complimentary groups, it is actually preferable that a user enters the minimum input necessary, but in the event that user enters more than necessary, this calculation route is intended to account for that. Excess information is oftentimes prone to error (e.g. percent sums don't add up to 100, or ratios between mass and percent don't match between different comonomers). As a result, that possibility needs to be considered, and either reject the user's input or complete the calculation if there are no errors.

#### Excess Weight Percent Info Route
For this calculation route, the mass sum must be calculated first so that all other values can be calculated as needed. However, calculating the mass sum is complicated by the existence of two unknowns: the mass sum and the mass of the unknown comonomer. As such, to calculate the mass sum, there are two equations which consider the knowns and unknowns for the mass and weight percents. For these two equations, the first of them works on the basis that once the known masses' moles are subtracted from the total moles, we end up with the remaining moles which are occupied by the remaining weight percents and the unknown comonomer. The second of the two works on the basis that once the weight percents are subtracted from 100 to find the remaining weight percent, this remaining weight percent is occupied by the remaining masses and unknown comonomer.

The main issue that has to be solved in this route is eliminating the two unknown variables present so that there is only one remaining. In this case, the one unknown variable to determine is the total mass sum.  This is accomplished by:
* (1) finding the total moles that the weight percents and unknown account for (e.g. if the total moles were 0.8 mol, and the moles accounted by the masses were 0.15 mol, then this value would be 0.65 mol). 
* (2) then, for each weight percent, its percent is treated as a real number (between 0 and 1) divided by its respective molar mass to bring it into terms of moles / grams, and these values are summed to give the weight percents' contribution to the mole sum.
* (3) the weight percent occupied by the masses and unknown are calculated by summing the given weight percents, then later finding the difference between that value and 100 (e.g. if the summed weight percents were 30%, then this value would be 70 wt%).
* (4) with the weight percent occupied by mass and the unknown, it is set equal to each mass divided by total mass (x) and the unknown mass divided by x as well. This equation can be rearranged so that it set equal to the value of the unknown's mass.
* (5) with two equations with two unknowns, one of the the unknown variables can be eliminated and the total mass can be solved for.

---
KNOWN VALUES
- `wtp` = Weight Percent Value Given for n# comonomer
- `mas` = Mass Value Value Given for n# comonomer
- `mom` = Molar Mass Value Given for n# comonomer
--- 
UNKNOWN VALUES
- `???` = Unknown Comonomer
- `x` = total_mass

- `[-]` - Indicates that a value is not given or able to calculated immediately

---
EQUATIONS
- I:      `part_mol_sum = sum((wtp_n1 / mom_n1) * [x] + (wtp_n2 / mom_n2) * [x] + ...) + [???_mas] / ???_mom`
- II:     `((100.0 - part_percent_sum) / 100.0) =  sum((mas_n1 / [x]) + (mas_n2 / [x]) + ...) + [???_mas] / [x]`

Combine equations I & II...
- III:    `part_mol_sum = sum((wtp_n1 / mom_n1) * [x] + (wtp_n2 / mom_n2) * [x] + ...) + ((100.0 - part_percent_sum) / 100.0) [x] / ???_mom + sum(mas_n1 + mas_n2 + ...)`

Now the only unknown is x (total mass), and it can be solved for.

Rearranged to be set equal to total mass...
- IV:     `x = (part_mol_sum + unknown_mol_offset) / (percent_contribution_to_mol_sum + ((100.0 - part_percent_sum) / 100.0) / ???_mom)`