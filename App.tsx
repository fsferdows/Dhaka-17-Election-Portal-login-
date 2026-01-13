
import React, { useState, useMemo, useEffect } from 'react';
import { UserRole, Candidate, User, ViewState, Notification, VotingCenter, NewsItem, IncidentReport } from './types';
import { INITIAL_CANDIDATES, VOTING_CENTERS, NEWS_FEED, CONSTITUENCY_DETAILS } from './constants';
import Layout from './components/Layout';
import ChatBot from './components/ChatBot';

const App: React.FC = () => {
  const [lang, setLang] = useState<'EN' | 'BN'>('BN');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>(INITIAL_CANDIDATES);
  const [centers] = useState<VotingCenter[]>(VOTING_CENTERS);
  const [news] = useState<NewsItem[]>(NEWS_FEED);
  const [view, setView] = useState<ViewState>('AUTH');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Translation Helper
  const t = (en: string, bn: string) => lang === 'BN' ? bn : en;

  // Masking Helpers
  const maskPhone = (p?: string) => {
    if (!p) return 'N/A';
    const clean = p.replace(/\s/g, '');
    return clean.substring(0, clean.length - 6) + '******';
  };

  const maskEmail = (e?: string) => {
    if (!e) return 'N/A';
    const [user, domain] = e.split('@');
    if (user.length <= 3) return `***@${domain}`;
    return `${user.substring(0, 3)}****@${domain}`;
  };

  // Incident state
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [newIncident, setNewIncident] = useState({ type: 'General', location: '', description: '' });

  // Auth state
  const [userName, setUserName] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'DETAILS' | 'OTP'>('DETAILS');
  const [authRole, setAuthRole] = useState<UserRole>(UserRole.VOTER);

  const handleLogin = () => {
    if (step === 'DETAILS') {
      if (phone.length >= 10 && userName.trim() && userAddress.trim()) {
        setStep('OTP');
      } else {
        alert(t('Please complete all fields.', 'অনুগ্রহ করে সব ঘর পূরণ করুন।'));
      }
    } else {
      if (otp === '1234') {
        setCurrentUser({
          id: 'u_' + phone,
          name: userName,
          address: userAddress,
          phone,
          role: authRole,
          followedCandidates: [],
          notifications: []
        });
        setView(authRole === UserRole.ADMIN ? 'ADMIN_DASHBOARD' : authRole === UserRole.CANDIDATE ? 'CANDIDATE_DASHBOARD' : 'VOTER_DASHBOARD');
      } else alert(t('Invalid OTP (Demo: 1234)', 'ভুল ওটিপি (ডেমো: ১২৩৪)'));
    }
  };

  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => 
      c.isApproved && 
      (c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
       c.party.toLowerCase().includes(searchTerm.toLowerCase()) ||
       c.symbol.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [candidates, searchTerm]);

  const renderAuth = () => (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#006a4e] relative overflow-hidden">
      <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl p-6 sm:p-10 relative z-10 border border-emerald-900/10">
        <div className="text-center mb-8">
           <div className="inline-block p-4 bg-emerald-50 rounded-full mb-4">
              <div className="w-12 h-12 bg-[#f42a41] rounded-full flex items-center justify-center shadow-lg">
                 <div className="w-5 h-5 bg-white rounded-full"></div>
              </div>
           </div>
           <h2 className="text-2xl font-black text-slate-900 font-bn">{t('Dhaka-17 Election Portal', 'ঢাকা-১৭ নির্বাচনী পোর্টাল')}</h2>
           <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2">Constituency 190 | EC Bangladesh</p>
        </div>

        <div className="space-y-5">
          {step === 'DETAILS' ? (
            <>
              <div className="flex bg-slate-100 p-1 rounded-2xl">
                 <button onClick={() => setLang('BN')} className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${lang === 'BN' ? 'bg-white shadow text-emerald-800' : 'text-slate-500'}`}>বাংলা</button>
                 <button onClick={() => setLang('EN')} className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${lang === 'EN' ? 'bg-white shadow text-emerald-800' : 'text-slate-500'}`}>English</button>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-widest font-bn">{t('Identity Role', 'আপনার ভূমিকা নির্বাচন করুন')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {[UserRole.VOTER, UserRole.CANDIDATE, UserRole.ADMIN].map(role => (
                    <button
                      key={role}
                      onClick={() => setAuthRole(role)}
                      className={`py-3 text-[10px] font-bold rounded-xl border transition-all font-bn ${
                        authRole === role 
                          ? 'bg-emerald-800 border-emerald-800 text-white shadow-lg shadow-emerald-200' 
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      {t(role, role === 'VOTER' ? 'ভোটার' : role === 'CANDIDATE' ? 'প্রার্থী' : 'অ্যাডমিন')}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder={t("Full Name (as per NID)", "আপনার নাম (এনআইডি অনুযায়ী)")}
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-emerald-500 transition-all outline-none font-bn text-sm font-semibold"
                />
                <input
                  type="text"
                  placeholder={t("Area (e.g. Gulshan)", "এলাকা (যেমন: গুলশান)")}
                  value={userAddress}
                  onChange={(e) => setUserAddress(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-emerald-500 transition-all outline-none font-bn text-sm font-semibold"
                />
                <input
                  type="tel"
                  placeholder={t("Phone Number", "মোবাইল নম্বর")}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-emerald-500 transition-all outline-none text-sm font-semibold"
                />
              </div>
            </>
          ) : (
            <div className="space-y-6 text-center">
              <p className="text-sm font-medium text-slate-600 font-bn">{t(`Enter the code sent to ${phone}`, `${phone} নম্বরে পাঠানো ওটিপি কোডটি দিন`)}</p>
              <input
                type="text"
                placeholder="1234"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-6 py-5 rounded-2xl bg-slate-50 border-2 border-emerald-500/20 text-center text-3xl font-black tracking-[0.4em] outline-none"
                maxLength={4}
              />
              <button onClick={() => setStep('DETAILS')} className="text-xs font-bold text-emerald-800 uppercase tracking-widest hover:underline">{t('Change Details', 'তথ্য পরিবর্তন করুন')}</button>
            </div>
          )}

          <button
            onClick={handleLogin}
            className="w-full bg-[#006a4e] text-white py-5 rounded-2xl font-black text-sm shadow-xl hover:bg-emerald-900 transition-all active:scale-95 font-bn"
          >
            {step === 'DETAILS' ? t('Get Verification Code', 'ভেরিফিকেশন কোড পান') : t('Enter Portal', 'পোর্টালে প্রবেশ করুন')}
          </button>
        </div>
        
        <p className="text-center text-[10px] text-slate-400 mt-8 font-bn uppercase tracking-widest">{t('Safe & Secure • Election Commission Simulation', 'নিরাপদ ও সুরক্ষিত • নির্বাচন কমিশন সিমুলেশন')}</p>
      </div>
    </div>
  );

  const renderVoterDashboard = () => (
    <Layout title={t('Citizen Dashboard', 'নাগরিক ড্যাশবোর্ড')} role={UserRole.VOTER} onLogout={() => setView('AUTH')} onNavigate={setView}>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-10">
        <div className="lg:col-span-3 space-y-8 lg:space-y-12">
          
          {/* Digital Voter Slip - Responsive Redesign */}
          <div className="bg-white rounded-[40px] p-8 lg:p-12 shadow-xl border-t-8 border-emerald-800 relative overflow-hidden group">
             <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
                <div className="space-y-6 flex-grow">
                   <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse"></div>
                      {t('Verified Identity', 'যাচাইকৃত ভোটার পরিচয়')}
                   </div>
                   <h3 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter leading-tight font-bn">
                      {currentUser?.name}
                   </h3>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-12">
                      <div className="space-y-1">
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('Ward & Area', 'ওয়ার্ড ও এলাকা')}</p>
                         <p className="text-base font-bold text-slate-800 font-bn">১৮ নং ওয়ার্ড, গুলশান-২</p>
                      </div>
                      <div className="space-y-1">
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('Polling Station', 'ভোটকেন্দ্র')}</p>
                         <p className="text-base font-bold text-slate-800 font-bn">গুলশান মডেল হাই স্কুল</p>
                      </div>
                   </div>
                   <div className="pt-4">
                      <button className="bg-emerald-800 hover:bg-emerald-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-900/10 transition-all font-bn">
                         {t('Print Digital Slip', 'ডিজিটাল স্লিপ প্রিন্ট করুন')}
                      </button>
                   </div>
                </div>
                <div className="bg-slate-50 p-6 rounded-[32px] shadow-inner border border-slate-100 flex flex-col items-center shrink-0 w-full md:w-auto">
                   <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=DH17-V-${currentUser?.id}`} className="w-32 h-32 grayscale mb-4" />
                   <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">ID: DH17-V-3029</span>
                </div>
             </div>
             <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl"></div>
          </div>

          {/* Real-Time Election Monitor - Grid Fix */}
          <div className="bg-white rounded-[40px] p-8 lg:p-12 border border-slate-100 shadow-sm">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight font-bn">{t('Live Election Updates', 'লাইভ নির্বাচনী আপডেট')}</h3>
                <div className="flex gap-2">
                   <span className="bg-red-50 text-red-600 text-[10px] font-black px-4 py-2 rounded-xl animate-pulse">LIVE</span>
                   <span className="bg-slate-50 text-slate-400 text-[10px] font-black px-4 py-2 rounded-xl">DH-17 CONSTITUENCY</span>
                </div>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[
                  { ward: '১৫', turnout: '৫২%', label: 'ক্যান্টনমেন্ট' },
                  { ward: '১৮', turnout: '৬৮%', label: 'গুলশান' },
                  { ward: '১৯', turnout: '৪৪%', label: 'বনানী' }
                ].map(item => (
                  <div key={item.ward} className="bg-slate-50 p-6 rounded-[32px] border border-slate-100">
                     <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">{t(`Ward ${item.ward}`, `ওয়ার্ড ${item.ward} (${item.label})`)}</p>
                     <div className="flex items-end justify-between mb-4">
                        <span className="text-3xl font-black text-slate-900">{item.turnout}</span>
                        <span className="text-[9px] font-black text-emerald-600 uppercase mb-1">{t('Turnout', 'ভোট পড়েছে')}</span>
                     </div>
                     <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600 rounded-full" style={{ width: lang === 'BN' ? '60%' : item.turnout }}></div>
                     </div>
                  </div>
                ))}
             </div>
          </div>

          {/* Candidate Contact Directory - NEW SECTION */}
          {(currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.VOTER) && (
            <div className="bg-white rounded-[40px] p-8 lg:p-12 border border-slate-100 shadow-sm space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-8 bg-emerald-700 rounded-full"></div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight font-bn">
                    {t('Candidate Contact Directory', 'প্রার্থী যোগাযোগ ডিরেক্টরি')}
                  </h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                    {currentUser?.role === UserRole.ADMIN ? t('Administrative Access: Unmasked', 'প্রশাসনিক অ্যাক্সেস: আনমাস্কড') : t('Citizen View: Identity Protected', 'নাগরিক ভিউ: পরিচয় সংরক্ষিত')}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {candidates.map(c => (
                  <div key={c.id} className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 flex items-center gap-6">
                    <img src={c.imageUrl} className="w-16 h-16 rounded-2xl object-cover grayscale" />
                    <div className="flex-grow min-w-0">
                      <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest truncate">{c.party}</p>
                      <h4 className="text-lg font-black text-slate-900 font-bn truncate">{c.name}</h4>
                      <div className="mt-3 space-y-1">
                        <div className="flex items-center gap-2">
                          <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                          <span className="text-[11px] font-bold text-slate-600">
                            {currentUser?.role === UserRole.ADMIN ? c.phone : maskPhone(c.phone)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                          <span className="text-[11px] font-bold text-slate-600 truncate">
                            {currentUser?.role === UserRole.ADMIN ? c.email : maskEmail(c.email)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Candidates Section */}
          <div className="space-y-10">
             <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <h3 className="text-4xl font-black text-slate-900 tracking-tighter font-bn">{t('Candidate List', 'প্রার্থী তালিকা')}</h3>
                <div className="relative w-full md:w-80">
                   <input 
                    type="text" 
                    placeholder={t("Search by symbol...", "প্রতীক দিয়ে খুঁজুন...")}
                    className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border border-slate-200 focus:ring-4 focus:ring-emerald-500/5 outline-none font-bn text-sm font-semibold shadow-sm"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                   />
                   <svg className="w-5 h-5 absolute left-4 top-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredCandidates.map(c => (
                  <div key={c.id} className="bg-white rounded-[48px] overflow-hidden border border-slate-100 shadow-xl hover:-translate-y-2 transition-all duration-500 group cursor-pointer" onClick={() => { setSelectedCandidateId(c.id); setView('PROFILE_VIEW'); }}>
                     <div className="h-64 relative">
                        <img src={c.imageUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent"></div>
                        <div className="absolute bottom-8 left-8">
                           <div className="bg-emerald-600 text-white text-[9px] font-black px-4 py-2 rounded-xl uppercase tracking-widest shadow-lg mb-3 inline-block">
                              {c.symbol}
                           </div>
                           <h4 className="text-white text-3xl font-black tracking-tight font-bn">{c.name}</h4>
                        </div>
                     </div>
                     <div className="p-8 space-y-6">
                        <p className="text-slate-500 text-xs font-medium italic line-clamp-2 leading-relaxed">"{c.manifesto}"</p>
                        <div className="pt-2 border-t border-slate-50 flex justify-between items-center">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.party}</span>
                           <span className="text-emerald-700 font-black text-xs uppercase tracking-widest group-hover:underline">{t('View Details', 'বিস্তারিত দেখুন')}</span>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Sidebar - Official Services */}
        <div className="space-y-6">
           <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl space-y-8">
              <h4 className="text-xl font-black tracking-tight font-bn">{t('Quick Links', 'দ্রুত লিংক')}</h4>
              <div className="space-y-4">
                 {[
                   { id: 'VOTING_GUIDE', en: 'How to Vote', bn: 'ভোট দেওয়ার নিয়ম' },
                   { id: 'CENTER_FINDER', en: 'Find Polling Station', bn: 'ভোটকেন্দ্র খুঁজুন' },
                   { id: 'INCIDENT_REPORT', en: 'Report Incident', bn: 'অভিযোগ করুন' },
                   { id: 'CODE_OF_CONDUCT', en: 'Candidate Rules', bn: 'আচরণবিধি' }
                 ].map(link => (
                   <button 
                    key={link.id} 
                    onClick={() => setView(link.id as ViewState)}
                    className="w-full text-left p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group flex items-center justify-between"
                   >
                      <span className="text-sm font-bold font-bn">{t(link.en, link.bn)}</span>
                      <svg className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                   </button>
                 ))}
              </div>
           </div>

           <div className="bg-emerald-50 rounded-[40px] p-8 border border-emerald-100 space-y-6">
              <h4 className="text-xl font-black text-emerald-900 tracking-tight font-bn">{t('News Hub', 'নির্বাচনী খবর')}</h4>
              <div className="space-y-6">
                 {news.slice(0, 3).map(item => (
                   <div key={item.id} className="group cursor-pointer">
                      <p className="text-xs font-bold text-slate-800 leading-relaxed font-bn group-hover:text-emerald-800 transition-colors">{item.title}</p>
                      <div className="flex items-center gap-2 mt-2">
                         <span className="text-[8px] font-black text-slate-400 uppercase">{item.source}</span>
                         <span className="text-slate-300">•</span>
                         <span className="text-[8px] font-bold text-slate-400">{item.time}</span>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </Layout>
  );

  const renderPrivacyPolicy = () => (
    <Layout title={t('Privacy Policy', 'গোপনীয়তা নীতি')} onLogout={() => setView('AUTH')} onNavigate={setView}>
      <div className="max-w-4xl mx-auto space-y-12 pb-20">
        <button onClick={() => setView('VOTER_DASHBOARD')} className="text-emerald-800 font-black flex items-center hover:-translate-x-2 transition-transform text-[10px] uppercase tracking-widest font-bn">
          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg> 
          {t('Back to Dashboard', 'ড্যাশবোর্ডে ফিরুন')}
        </button>
        
        <div className="bg-white rounded-[50px] shadow-3xl overflow-hidden border border-slate-100 p-12 lg:p-20 space-y-12">
          <div className="space-y-6">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight font-bn">
              {t('Data Handling & Security Protocol', 'তথ্য সুরক্ষা ও পরিচালনা প্রোটোকল')}
            </h3>
            <p className="text-slate-500 font-medium leading-relaxed font-bn">
              {t(
                'The Dhaka-17 Election Portal is committed to maintaining the highest standards of data privacy and voter integrity. This platform operates under simulation guidelines but adheres to real-world encryption standards.',
                'ঢাকা-১৭ নির্বাচনী পোর্টাল সর্বোচ্চ মানের তথ্য গোপনীয়তা এবং ভোটার অখণ্ডতা বজায় রাখতে প্রতিশ্রুতিবদ্ধ। এই প্ল্যাটফর্মটি সিমুলেশন নির্দেশিকা অধীনে পরিচালিত হলেও বাস্তব বিশ্বের এনক্রিপশন মান মেনে চলে।'
              )}
            </p>
          </div>

          <div className="grid gap-8">
            {[
              { 
                t: t('Personal Identification', 'ব্যক্তিগত পরিচয়'), 
                d: t('Names, NIDs, and phone numbers are encrypted using SSL/TLS protocols and are never shared with third-party vendors.', 'নাম, এনআইডি এবং মোবাইল নম্বর SSL/TLS প্রোটোকল ব্যবহার করে এনক্রিপ্ট করা হয় এবং কখনো তৃতীয় পক্ষের সাথে শেয়ার করা হয় না।') 
              },
              { 
                t: t('Location Data', 'অবস্থান সংক্রান্ত তথ্য'), 
                d: t('Your area details are only used to provide accurate polling station information and real-time ward turnout statistics.', 'আপনার এলাকার তথ্য শুধুমাত্র সঠিক ভোটকেন্দ্রের তথ্য এবং লাইভ ওয়ার্ড টার্নআউট পরিসংখ্যান প্রদানের জন্য ব্যবহৃত হয়।') 
              },
              { 
                t: t('AI Interaction', 'এআই ইন্টারঅ্যাকশন'), 
                d: t('Queries directed to the AI assistant are anonymized and used solely to improve the quality of election assistance.', 'এআই অ্যাসিস্ট্যান্টকে করা প্রশ্নগুলো বেনামী করা হয় এবং শুধুমাত্র নির্বাচনী সহায়তার মান উন্নত করতে ব্যবহৃত হয়।') 
              },
              { 
                t: t('Voter Slip Security', 'ভোটার স্লিপ নিরাপত্তা'), 
                d: t('Digital voter slips are generated per-session and require OTP verification for access to prevent unauthorized viewing.', 'অননুমোদিত দেখা রোধ করতে ডিজিটাল ভোটার স্লিপগুলো প্রতিটি সেশনে জেনারেট করা হয় এবং অ্যাক্সেসের জন্য ওটিপি ভেরিফিকেশন প্রয়োজন।') 
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-slate-50 p-8 rounded-[32px] border-l-4 border-emerald-600">
                <h4 className="text-lg font-black text-slate-900 mb-2 font-bn">{item.t}</h4>
                <p className="text-slate-500 text-sm font-medium leading-relaxed font-bn italic">{item.d}</p>
              </div>
            ))}
          </div>

          <div className="pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
               </div>
               <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t('Absolute Integrity Guaranteed', 'সম্পূর্ণ অখণ্ডতা নিশ্চিত')}</p>
            </div>
            <p className="text-[9px] text-slate-400 italic">Last Updated: Dec 2024 • Version 2.0.1</p>
          </div>
        </div>
      </div>
    </Layout>
  );

  return (
    <div className="min-h-screen bg-[#fcfdfe] font-sans">
      {view === 'AUTH' && renderAuth()}
      {view === 'VOTER_DASHBOARD' && renderVoterDashboard()}
      {view === 'PRIVACY_POLICY' && renderPrivacyPolicy()}
      
      {/* Dynamic View Logic for responsiveness */}
      {view === 'PROFILE_VIEW' && (
        <Layout title={t('Candidate Profile', 'প্রার্থীর প্রোফাইল')} onLogout={() => setView('AUTH')} onNavigate={setView}>
           <div className="max-w-4xl mx-auto py-10">
              <button onClick={() => setView('VOTER_DASHBOARD')} className="mb-8 flex items-center gap-2 text-emerald-800 font-black text-xs uppercase group font-bn">
                 <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                 {t('Back to Dashboard', 'ড্যাশবোর্ডে ফিরুন')}
              </button>
              {/* Detailed profile content would render here */}
           </div>
        </Layout>
      )}

      {view !== 'AUTH' && <ChatBot candidates={candidates} />}
    </div>
  );
};

export default App;
