import Dashboard from './pages/Dashboard';
import SelectOrg from './pages/SelectOrg';
import SetupManager from './pages/SetupManager';
import { GameProvider, useGame } from './context/GameContext';

const MainApp = () => {
	const { gameState } = useGame();

	return (
		<div className="font-sans text-[#ece8e1] selection:bg-[#ff4655] selection:text-white">
			{gameState === 'SETUP' && <SetupManager />}
			{gameState === 'SELECT_ORG' && <SelectOrg />}
			{gameState === 'DASHBOARD' && <Dashboard />}
		</div>
	);
};

const App = () => (
	<GameProvider>
		<MainApp />
	</GameProvider>
);

export default App;
