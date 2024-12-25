import Navbar from "../../../components/Navbar";
import { menuItems, userOptions } from "../../../data/menuSpv";

export default function PembelianStok() {
    return (
        <>
            <Navbar menuItems={menuItems} userOptions={userOptions}>
            <div>
                <h1>Your Custom Content Here</h1>
                <p>This is dynamic content in the main area.</p>
            </div>
            </Navbar>
        </>
    );
}
