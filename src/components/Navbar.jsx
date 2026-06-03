import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Plane, Compass, Home, Map, Globe, Languages } from 'lucide-react';
import { useTranslation } from '../store/useLangStore';
import { langNames } from '../utils/translations';

const Navbar = () => {
    const navigate = useNavigate();
    const { t, setLang, lang } = useTranslation();

    return (
        <nav className="fixed top-0 left-0 right-0 h-16 glass z-50 flex items-center px-6 md:px-12 justify-between border-b border-white/5">
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate('/')}>
                <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-[#003580] to-[#0071c2] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                    <Compass className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col space-y-0">
                    <span className="text-2xl font-black tracking-tighter text-[#1a1a1a]">
                        MAFTRAVEL
                    </span>
                    <span className="text-[8px] font-bold text-[#9ca3af] uppercase tracking-widest leading-none">
                        {t('footer.brandSub')}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-6 md:gap-10">
                <NavLink
                    to="/"
                    className={({ isActive }) => `flex items-center gap-2 text-sm font-medium transition-colors hover:text-[#0071c2] ${isActive ? 'text-[#0071c2]' : 'text-gray-400'}`}
                >
                    <Home className="w-4 h-4 md:hidden" />
                    <span className="hidden md:inline">{t('nav.home')}</span>
                </NavLink>
                <NavLink
                    to="/planner"
                    className={({ isActive }) => `flex items-center gap-2 text-sm font-medium transition-colors hover:text-[#0071c2] ${isActive ? 'text-[#0071c2]' : 'text-gray-400'}`}
                >
                    <Map className="w-4 h-4 md:hidden" />
                    <span className="hidden md:inline">{t('nav.planner')}</span>
                </NavLink>
                <NavLink
                    to="/flights"
                    className={({ isActive }) => `flex items-center gap-2 text-sm font-medium transition-colors hover:text-[#0071c2] ${isActive ? 'text-[#0071c2]' : 'text-gray-400'}`}
                >
                    <Plane className="w-4 h-4 md:hidden" />
                    <span className="hidden md:inline">{t('nav.flights')}</span>
                </NavLink>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-[#f0f5ff] rounded-full p-1 border border-[#eef2f6]">
                    {Object.keys(langNames).map((l) => (
                        <button
                            key={l}
                            onClick={() => setLang(l)}
                            className={`px-3 py-1 rounded-full text-[10px] font-black transition-all ${
                                lang === l 
                                ? 'bg-[#0071c2] text-white shadow-md scale-105' 
                                : 'text-[#9ca3af] hover:text-[#0071c2]'
                            }`}
                        >
                            {langNames[l]}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => navigate('/planner')}
                    className="hidden lg:block px-6 py-2 rounded-full bg-[#0071c2] text-white font-black text-[12px] uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#0071c2]/20"
                >
                    {t('nav.book')}
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
