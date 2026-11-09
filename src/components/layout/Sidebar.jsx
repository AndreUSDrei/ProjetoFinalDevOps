import React from 'react';
import { LayoutDashboard, Users, DollarSign, Settings, LogOut } from 'lucide-react';
import { useGame } from '../../context/GameContext';

const Sidebar = () => {
	const { organization, currentView, setCurrentView, resetGame } = useGame();

	const menuItems = [
		{
			id: 'overview',
			label: 'Club Overview',
			icon: LayoutDashboard,
			badge: null,
		},
		{
			id: 'squad',
			label: 'Squad Management',
			icon: Users,
			badge: 'Fase 3',
		},
		{
			id: 'transfers',
			label: 'Transfer Market',
			icon: DollarSign,
			badge: 'Fase 2',
		},
	];

	return (
		<aside className="w-64 bg-[#111827] border-r border-[#1f2937] flex flex-col justify-between shrink-0 h-full select-none">
			<div>
				{/* Brand Title */}
				<div className="p-6 border-b border-[#1f2937]">
					<div className="flex items-center gap-2">
						<div className="w-2.5 h-6 bg-[#ff4655]" />
						<h1 className="text-2xl font-black tracking-tighter text-white">
							V<span className="text-[#ff4655]">MANAGER</span>
						</h1>
					</div>
					<p className="text-xs text-gray-500 mt-1 uppercase font-bold tracking-widest pl-4">
						{organization?.name || 'VCT'} Hub
					</p>
				</div>

				{/* Navigation */}
				<nav className="p-4 space-y-2">
					{menuItems.map((item) => {
						const Icon = item.icon;
						const isActive = currentView === item.id;

						return (
							<button
								key={item.id}
								onClick={() => setCurrentView(item.id)}
								className={`w-full flex items-center justify-between px-4 py-3 rounded-md transition-all duration-200 group ${
									isActive
										? 'bg-[#ff4655] text-white shadow-[0_0_15px_rgba(255,70,85,0.4)]'
										: 'text-gray-400 hover:bg-[#1f2937] hover:text-[#ece8e1]'
								}`}
							>
								<div className="flex items-center space-x-3">
									<Icon size={18} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'} />
									<span className="font-semibold text-sm tracking-wide">{item.label}</span>
								</div>
								{item.badge && (
									<span
										className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
											isActive ? 'bg-black/30 text-white' : 'bg-[#0f1923] text-gray-400 border border-[#1f2937]'
										}`}
									>
										{item.badge}
									</span>
								)}
							</button>
						);
					})}
				</nav>
			</div>

			{/* Footer Navigation */}
			<div className="p-4 border-t border-[#1f2937] space-y-2">
				<button
					type="button"
					className="w-full flex items-center space-x-3 px-4 py-3 rounded-md text-gray-400 hover:bg-[#1f2937] hover:text-[#ece8e1] transition-colors"
				>
					<Settings size={18} />
					<span className="font-semibold text-sm tracking-wide">Settings</span>
				</button>
				<button
					type="button"
					onClick={resetGame}
					className="w-full flex items-center space-x-3 px-4 py-3 rounded-md text-red-400 hover:bg-red-500/10 transition-colors"
				>
					<LogOut size={18} />
					<span className="font-semibold text-sm tracking-wide">Retire / Restart</span>
				</button>
			</div>
		</aside>
	);
};

export default Sidebar;

