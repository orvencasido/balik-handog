"use client";

import Image from "next/image";
import logoCathedral from "../logo-cathedral.svg";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 sm:space-y-12 py-4 sm:py-8 px-1">
      {/* 1. Project Header & Story */}
      <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden p-6 sm:p-12 relative">
        {/* Decorative Watermark - scaled for mobile */}
        <div className="absolute top-0 right-0 p-4 sm:p-8 opacity-[0.03] sm:opacity-5 pointer-events-none">
          <Image src={logoCathedral} alt="Decoration" className="w-32 h-32 sm:w-48 sm:h-48 object-contain" />
        </div>

        <div className="max-w-2xl relative z-10 space-y-6 sm:space-y-8">
          <div className="space-y-2 sm:space-y-3">
            <h1 className="text-2xl sm:text-3xl font-black text-emerald-950 uppercase tracking-tighter leading-none">BALIK HANDOG DONATION</h1>
            <p className="text-[9px] sm:text-[10px] font-black text-emerald-600/50 uppercase tracking-widest inline-block border-b-2 border-emerald-100 pb-2">St. Ferdinand Cathedral</p>
          </div>

          <div className="space-y-4 sm:space-y-6 text-xs sm:text-sm font-bold text-zinc-500 leading-relaxed tracking-tight">
            <p>
              Balik-Handog Donation System is a heartfelt initiative aimed at modernizing the donation records of St. Ferdinand Cathedral.
              This digital management system replaces the traditional paper-based method, ensuring that every contribution
              is transparently and accurately tracked.
            </p>
            <p>
              This project was created in response to a request from Ms. Mabel Lagustan, the mother of the developer's special
              someone. As a software engineer, it was also an opportunity to offer a modern solution in service to the Lord.
              I worked on this project during my free time, dedicating my nights to its development, as I have a corporate job in the morning.
              Remarkably, the entire solution was built in less than a month, utilizing agile development to meet the Cathedral’s needs promptly.
            </p>
            <p className="italic text-emerald-700/60 text-[10px] sm:text-xs">
              This platform was designed to promote digital modernization, beginning with the Cathedral's innovative approach
              to systematizing donations.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Business CTA / Ads Section */}
      <section className="bg-emerald-950 rounded-[2rem] overflow-hidden shadow-2xl shadow-emerald-950/20 border border-emerald-900 group">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left: Marketing Text */}
          <div className="p-6 sm:p-12 space-y-6 sm:space-y-8">
            <div className="space-y-3 sm:space-y-4">
              <span className="inline-block px-2.5 py-1 bg-emerald-500 text-white text-[7px] sm:text-[8px] font-black uppercase tracking-widest rounded-lg animate-pulse">Available for Projects</span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase leading-tight">
                Want to <span className="text-emerald-400">Boost Your Presence</span> Online?
              </h2>
              <p className="text-[10px] sm:text-xs font-bold text-emerald-100/40 uppercase tracking-widest leading-relaxed text-justify">
                Hi, I'm Orven Casido, a Full Stack Software Engineer. I build custom software solutions for businesses and organizations,
                and I automate repetitive tasks to help them save time and resources. I excel at researching the latest technologies and
                implementing them to solve problems.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <a
                href="mailto:orvencasidop@gmail.com"
                className="w-full sm:w-fit px-8 py-3.5 sm:py-4 bg-white text-emerald-950 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50 hover:scale-[1.02] active:scale-95 transition-all text-center"
              >
                Contact Me Now
              </a>
              <div className="text-[8px] sm:text-[9px] font-black text-emerald-400/60 uppercase tracking-widest text-center sm:text-left">
                Email: <span className="text-white ml-1.5 break-all sm:break-normal lowercase">orvencasidop@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Right: Decorative / Abstract Business Card Look */}
          <div className="bg-emerald-900/40 p-10 sm:p-12 flex items-center justify-center relative overflow-hidden min-h-[220px]">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-400 via-transparent to-transparent"></div>
            <div className="relative z-10 text-center space-y-4">
              <div className="bg-emerald-950 p-6 rounded-3xl border border-emerald-800 shadow-2xl">
                <h3 className="text-white font-black text-lg tracking-widest uppercase mb-1 leading-none">ORVEN CASIDO</h3>
                <p className="text-[8px] font-bold text-emerald-500 uppercase tracking-[0.3em]">Fullstack Software Engineer</p>
              </div>
              <p className="text-[7px] font-black text-emerald-400/30 uppercase tracking-widest">Custom Enterprise Solutions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Branding */}
      <div className="text-center pb-8 sm:pb-12">
        <p className="text-[8px] sm:text-[9px] font-black text-zinc-300 uppercase tracking-widest leading-relaxed px-4">
          St. Ferdinand Cathedral | Balik Handog Donation System <br className="hidden sm:block" />
          © Orven Casido | 2026
        </p>
      </div>
    </div>
  );
}
