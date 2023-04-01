import React from 'react';
import { useFuncGroups, useFuncDispatch } from '../contexts/FuncContext';
import { MONOMER_FORM } from '../contexts/page_names';
import { capitalizeFirstLetter } from '../utils/ornaments';

export default function FinalResults()
{
    const { funcGroups } = useFuncGroups();
    const { setPage } = useFuncDispatch();

    return (
        <div className="form_container">
            {funcGroups.map(({ name, monomers }) => 
                <section id={`${name}_results`} className="dynamic_form" key={`${name}_results`}>
                    <h2 className='group_heading'>{capitalizeFirstLetter(name)} Heading</h2>
                    <section className='ag_box'>
                        <table className='final_results'>
                            <thead>
                                <tr>
                                    <th id={`${name}_th`}>Monomer</th>
                                    <th id={`${name}_mass`}>Mass (g)</th>
                                    <th id={`${name}_wpercent`}>Weight Percent (%)</th>
                                    <th id={`${name}_mpercent`}>Mole Percent (%)</th>
                                    <th id={`${name}_molar_mass`}>Molar Mass (g/mol)</th>
                                    <th id={`${name}_moles`}>Moles (mol)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {monomers.map((monomer, monomer_num) => 
                                    <tr className='monomer_row' key={`${name}_row${monomer_num}`}>
                                        <td>{`${capitalizeFirstLetter(name)} ${monomer_num + 1}`}</td>
                                        <td>{monomer.display('mass')}</td>
                                        <td>{monomer.display('wpercent')}</td>
                                        <td>{monomer.display('mpercent')}</td>
                                        <td>{monomer.display('molar_mass')}</td>
                                        <td>{monomer.display('moles')}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </section>
                </section>
            )}
            <div id='monomer_submit_container' className='submit_container'>
                <button type='button' onClick={() => setPage({ page: MONOMER_FORM })} className='back_button'>Back</button>
            </div>
        </div>
    );
}