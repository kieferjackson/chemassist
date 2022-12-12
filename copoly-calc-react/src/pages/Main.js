import '../assets/main_style.css';
import WelcomeBanner from '../components/WelcomeBanner';
import FuncGroupForm from '../components/forms/FuncGroupForm';

export default function Main()
{
    return(
        <main>
            <WelcomeBanner />
            <FuncGroupForm />
        </main>
    )
}