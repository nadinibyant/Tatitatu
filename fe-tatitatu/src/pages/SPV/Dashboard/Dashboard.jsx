import Navbar from "../../../components/Navbar";
import { menuItems, userOptions } from "../../../data/menuSpv";

export default function Dashboard(){
    return(
        <>
        <Navbar menuItems={menuItems} userOptions={userOptions} label={'Dashboard'}>
            <div className="p-5">
                <p>ini dashboard</p>
            </div>
        </Navbar>
        </>
    )
}