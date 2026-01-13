
import React, { useState } from 'react';
import { UserRole, ViewState } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  role?: UserRole;
  onLogout: () => void;
  onNavigate?: (view: ViewState) => void;
  title: string;
}

const Layout: React.FC<LayoutProps> = ({ children, role, onLogout, onNavigate, title }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#fcfdfe]">
      {/* High-Performance Responsive Header */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-[50]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-20 md:h-24">
            <div className="flex items-center space-x-4">
              <div className="bg-[#006a4e] p-2 rounded-xl shadow-lg shadow-emerald-200">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 md:w-5 md:h-5 bg-[#f42a41] rounded-full"></div>
                </div>
              </div>
              <div className="hidden sm:block">
                 <h1 className="text-xl md:text-2xl font-black tracking-tighter text-slate-900 leading-none">DH-17 <span className="text-emerald-700">PORTAL</span></h1>
                 <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">E-GOVERNANCE BANGLADESH</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 md:space-x-8">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-[8px] font-black text-emerald-700 uppercase tracking-widest">CLEARANCE</span>
                <span className="text-sm font-black text-slate-900 tracking-tight">{role || 'GUEST'}</span>
              </div>
              <button 
                onClick={onLogout}
                className="bg-slate-900 hover:bg-red-700 text-white px-6 md:px-8 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95"
              >
                LOGOUT
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Responsive Container */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-6 py-10 md:py-16">
          <div className="mb-10 md:mb-16">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-none font-bn">{title}</h2>
          </div>
          {children}
        </div>
      </main>

      {/* Localized Mobile-Friendly Footer */}
      <footer className="bg-slate-900 py-16 md:py-24 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
             <div className="space-y-6">
                <div className="flex items-center space-x-3">
                   <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center font-black">17</div>
                   <h4 className="font-black text-2xl tracking-tighter font-bn">ঢাকা-১৭ পোর্টাল</h4>
                </div>
                <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-sm">Constituency 190 digital access point. Ensuring transparency, accessibility, and integrity for all citizens of Bangladesh.</p>
             </div>
             <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                   <h5 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Election</h5>
                   <ul className="text-slate-400 text-xs space-y-3 font-bold">
                      <li className="cursor-pointer hover:text-white" onClick={() => onNavigate?.('VOTER_DASHBOARD')}>Manifestos</li>
                      <li className="cursor-pointer hover:text-white" onClick={() => onNavigate?.('CENTER_FINDER')}>Stations</li>
                      <li className="cursor-pointer hover:text-white" onClick={() => onNavigate?.('CODE_OF_CONDUCT')}>Rules</li>
                   </ul>
                </div>
                <div className="space-y-4">
                   <h5 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Support</h5>
                   <ul className="text-slate-400 text-xs space-y-3 font-bold">
                      <li className="cursor-pointer hover:text-white" onClick={() => onNavigate?.('INCIDENT_REPORT')}>Helpline</li>
                      <li className="cursor-pointer hover:text-white" onClick={() => onNavigate?.('VOTING_GUIDE')}>FAQ</li>
                      <li className="cursor-pointer hover:text-white" onClick={() => onNavigate?.('PRIVACY_POLICY')}>Privacy Policy</li>
                   </ul>
                </div>
             </div>
             <div className="bg-white/5 p-8 rounded-[32px] border border-white/5">
                <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-4">Official Disclaimer</p>
                <p className="text-slate-400 text-[10px] leading-relaxed italic">This is a simulation platform designed for democratic educational purposes in the Dhaka-17 constituency.</p>
             </div>
          </div>
          <div className="mt-20 pt-10 border-t border-white/5 text-center flex flex-col items-center gap-6">
            <p className="text-slate-600 text-[9px] font-black uppercase tracking-[0.4em]">Absolute Integrity • Joy Bangla • Smart Bangladesh</p>
            <div className="flex flex-wrap justify-center items-center gap-4 text-slate-500 text-[9px] font-black uppercase tracking-widest">
              <span>Privacy</span>
              <span>•</span>
              <span>Security</span>
              <span>•</span>
              <span>Transparency</span>
              <span>•</span>
              <button 
                onClick={() => onNavigate?.('PRIVACY_POLICY')} 
                className="hover:text-emerald-400 transition-colors border-b border-transparent hover:border-emerald-400 pb-0.5"
              >
                Privacy Policy
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
