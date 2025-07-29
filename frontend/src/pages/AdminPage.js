import AdminDashboard from "../components/AdminDashboard";

const AdminPage = ({ user }) => {
  return (
    <div>
      <h1>Admin Panel</h1>
      <AdminDashboard user={user} />
    </div>
  );
};

export default AdminPage;
