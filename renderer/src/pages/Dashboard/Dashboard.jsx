import { Link } from "react-router-dom";  

const Dashboard = () => {
    return (
      <div style={{ textAlign: 'center', marginTop: '5rem' }}>
        <h1>Welcome to the Dashboard!</h1>
        <p>You have successfully logged in.</p>
        <Link to="/receipt-archive">Receipt Archive</Link>
        <br />
        <Link to="/product-management">Product Management</Link>
      </div>
    );
  };
  
  export default Dashboard;