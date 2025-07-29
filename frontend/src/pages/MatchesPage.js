import MatchList from "../components/MatchList";

const MatchesPage = ({ user }) => {
  return (
    <div>
      <h1>Matches</h1>
      <MatchList user={user} />
    </div>
  );
};

export default MatchesPage;
