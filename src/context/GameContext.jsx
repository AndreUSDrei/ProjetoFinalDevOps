import React, { createContext, useContext, useState } from 'react';

const GameContext = createContext(null);

export const useGame = () => {
	const context = useContext(GameContext);
	if (!context) {
		throw new Error('useGame must be used within a GameProvider');
	}
	return context;
};

export const GameProvider = ({ children }) => {
	// Game States: 'SETUP' | 'SELECT_ORG' | 'DASHBOARD'
	const [gameState, setGameState] = useState('SETUP');
	
	// Active Tab inside Dashboard: 'overview' | 'transfers' | 'squad'
	const [currentView, setCurrentView] = useState('overview');

	// Default Head Coach / GM Profile matching PRD section 2
	const [manager, setManager] = useState({
		managerName: 'Andreus Vinícius Araújo de Andrade',
		originCity: 'Wanel Ville',
		coachLevel: 25,
		overallRating: 82,
		reputation: 'National Prospect',
		// Backwards compatibility aliases:
		get name() {
			return this.managerName;
		},
		get origin() {
			return this.originCity;
		},
		get experience() {
			return `Nível ${this.coachLevel} (Overall ${this.overallRating})`;
		},
	});

	// Selected Franchise / Organization
	const [organization, setOrganization] = useState(null);

	// Available balance / Transfer budget
	const [budget, setBudget] = useState(0);

	// Active Roster (Starting 5 + up to 2 Substitutes)
	const [roster, setRoster] = useState({
		starters: [],
		substitutes: [],
	});

	// Select organization and initialize budget
	const handleSelectOrganization = (org) => {
		setOrganization(org);
		setBudget(org?.budget || 0);
	};

	// Reset Game to initial state
	const resetGame = () => {
		setGameState('SETUP');
		setCurrentView('overview');
		setOrganization(null);
		setBudget(0);
		setRoster({ starters: [], substitutes: [] });
	};

	const value = {
		gameState,
		setGameState,
		currentView,
		setCurrentView,
		manager,
		setManager,
		organization,
		setOrganization: handleSelectOrganization,
		budget,
		setBudget,
		roster,
		setRoster,
		resetGame,
	};

	return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
