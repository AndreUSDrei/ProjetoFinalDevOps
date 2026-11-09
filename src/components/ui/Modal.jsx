import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.key === 'Escape' && isOpen) {
				onClose();
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
			<div
				className="relative w-full max-w-lg bg-[#111827] border border-[#374151] rounded-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Top Accent bar */}
				<div className="h-1 w-full bg-[#ff4655]" />

				{/* Header */}
				<div className="flex items-center justify-between px-6 py-4 border-b border-[#1f2937]">
					<h3 className="text-lg font-black uppercase tracking-wider text-white">{title}</h3>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-white hover:bg-[#1f2937] p-1.5 rounded transition-colors"
						aria-label="Close modal"
					>
						<X size={18} />
					</button>
				</div>

				{/* Body */}
				<div className="p-6 text-gray-300">{children}</div>
			</div>
		</div>
	);
};

export default Modal;

