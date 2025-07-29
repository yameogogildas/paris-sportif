import UserBets from "../components/UserBets";

const BetsPage = ({ user }) => {
  return (
    <div>
      <h1>My Bets</h1>
      <UserBets user={user} />
    </div>
  );
};

export default BetsPage;
