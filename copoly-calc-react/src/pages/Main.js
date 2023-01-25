import '../assets/main_style.css';
import WelcomeBanner from '../components/WelcomeBanner';
import FuncGroupForm from '../components/forms/FuncGroupForm';
import MonomerForm from '../components/forms/MonomerForm';
// Track and set which page is displayed
import { useFuncGroups } from '../contexts/FuncContext';
import { FUNC_FORM, MONOMER_FORM, FINAL_RESULTS } from '../contexts/page_names';

const handlePageChange = (selected_page) => {
    switch (selected_page)
    {
        case FUNC_FORM:     return <FuncGroupForm />
        case MONOMER_FORM:  return <MonomerForm />
        case FINAL_RESULTS: return;
        // Invalid page selected
        default:            throw Error('Invalid page: ', selected_page);
    } 
}

export default function Main()
{
    const { page } = useFuncGroups();

    return(
        <main>
            <WelcomeBanner />
            {handlePageChange(page)}
        </main>
    )
}