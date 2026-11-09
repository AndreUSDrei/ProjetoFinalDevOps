import React from 'react';

const Badge = ({ children, variant = 'default', className = '' }) => {
	const variants = {
		default: 'border-gray-600 text-gray-300 bg-gray-800/50',
		red: 'border-[#ff4655]/50 text-[#ff4655] bg-[#ff4655]/10 shadow-[0_0_8px_rgba(255,70,85,0.2)]',
		yellow: 'border-yellow-500/50 text-yellow-400 bg-yellow-500/10 shadow-[0_0_8px_rgba(234,179,8,0.2)]',
		purple: 'border-purple-500/50 text-purple-400 bg-purple-500/10 shadow-[0_0_8px_rgba(168,85,247,0.2)]',
		blue: 'border-blue-500/50 text-blue-400 bg-blue-500/10 shadow-[0_0_8px_rgba(59,130,246,0.2)]',
		green: 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10 shadow-[0_0_8px_rgba(16,185,129,0.2)]',
	};

	const variantStyle = variants[variant] || variants.default;

	return (
		<span
			className={`inline-flex items-center px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider rounded border ${variantStyle} ${className}`}
		>
			{children}
		</span>
	);
};

export default Badge;

