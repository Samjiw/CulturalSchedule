import { MenuOutlined } from "@ant-design/icons";
import { Link } from 'react-router-dom';
import './Home.css';

function Header() {
    return (
        <div className="header">
            <MenuOutlined style={{ fontSize: "15px" }} />
            <span style={{ marginLeft: "10px", fontFamily: "inter", fontSize: "20" }}><Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>Cultural Schedule</Link></span>
        </div>
    );
}

export default Header;