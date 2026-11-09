import React from 'react';
import { LayoutDashboard, Users, DollarSign, Settings, LogOut } from 'lucide-react';
import { useGame } from '../../context/GameContext';

const Sidebar = () => {
	const { organization, currentView, setCurrentView, resetGame } = useGame();

	const menuItems = [
		{
			id: 'overview',
			label: 'Visão Geral do Clube',
			icon: LayoutDashboard,
		},
		{
			id: 'squad',
			label: 'Gestão do Elenco',
			icon: Users,
		},
		{
			id: 'transfers',
			label: 'Mercado de Transferências',
			icon: DollarSign,
		},
	];

	return (
		<aside className="w-64 bg-[#111827] border-r border-[#1f2937] flex flex-col justify-between shrink-0 h-full select-none">
			<div>
				{/* Marca do Jogo */}
				<div className="p-6 border-b border-[#1f2937]">
					<div className="flex items-center gap-2">
						<div className="w-2.5 h-6 bg-[#ff4655]" />
						<h1 className="text-2xl font-black tracking-tighter text-white">
							V<span className="text-[#ff4655]">MANAGER</span>
						</h1>
					</div>
					<p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-widest pl-4">
						{organization?.name || 'VCT'} Hub
					</p>
				</div>

				{/* Menu de Navegação */}
				<nav className="p-4 space-y-2">
					{menuItems.map((item) => {
						const Icon = item.icon;
						const isActive = currentView === item.id;

						return (
							<button
								key={item.id}
								onClick={() => setCurrentView(item.id)}
								className={`w-full flex items-center justify-between px-4 py-3 rounded-xs transition-all duration-200 group ${
									isActive
										? 'bg-[#ff4655] text-white shadow-[0_0_15px_rgba(255,70,85,0.4)]'
										: 'text-gray-400 hover:bg-[#1f2937] hover:text-[#ece8e1]'
								}`}
							>
								<div className="flex items-center space-x-3">
									<Icon size={18} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'} />
									<span className="font-bold text-sm tracking-wide">{item.label}</span>
								</div>
							</button>
						);
					})}
				</nav>
			</div>

			{/* Rodapé da Navegação */}
			<div className="p-4 border-t border-[#1f2937] space-y-2">
				<button
					type="button"
					className="w-full flex items-center space-x-3 px-4 py-3 rounded-xs text-gray-400 hover:bg-[#1f2937] hover:text-[#ece8e1] transition-colors"
				>
					<Settings size={18} />
					<span className="font-bold text-sm tracking-wide">Configurações</span>
				</button>
				<button
					type="button"
					onClick={resetGame}
					className="w-full flex items-center space-x-3 px-4 py-3 rounded-xs text-red-400 hover:bg-red-500/10 transition-colors"
				>
					<LogOut size={18} />
					<span className="font-bold text-sm tracking-wide">Reiniciar Carreira</span>
				</button>
			</div>
		</aside>
	);
};

export default Sidebar;
