import React from 'react';

export default function WelcomeBanner()
{
    return (
        <section className="welcome_banner">
            <h1>Copoly-Calc</h1>
            <p>
                Welcome to Copoly-Calc!<br />
                Copoly-Calc (name not final) is a work-in-progress web application designed to perform copolymerization calculations with minimal user input.<br />
                'Minimal user input' requires that:
            </p>
            <section className="explanation">
                <h3>For both Functional Groups</h3>
                <ol>
                    <li>A unique name must be given</li>
                    <li>Number of comonomers must be given</li>
                    <li>Molar mass for all comonomers must be given</li>
                    <li>A percent type (weight or mole) must be chosen</li>
                    <li>There can only be up to one unknown comonomer (neither mass nor percent being given) for each group</li>
                </ol>
        
                <h3>For Reference Group</h3>
                <ol>
                    <li>At least one comonomer's mass must be given</li>
                    <li>The number of values given for mass and percent combined must be greater than or equal to <em>n</em></li>
                </ol>
        
                <h3>For Complimentary Group</h3>
                <ol>
                    <li>The number of values given for mass and percent combined must be greater than or equal to <em>n - 1</em></li>
                </ol>
        
                <aside>
                    <em>n</em> - Number of comonomers given for an individual functional group.
                </aside>
            </section>
        </section>
    );
}