"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type Names = { one: string; two: string; date: string };
const DEFAULT: Names = { one: "Nour", two: "Adam", date: "12 June 2027" };
const Ctx = createContext<{ names: Names; set: (n: Partial<Names>) => void }>({ names: DEFAULT, set: () => {} });

/** The visitor's names, shared by the hero envelope and the design cards (in memory only). */
export function NamesProvider({ children }: { children: ReactNode }) {
  const [names, setNames] = useState(DEFAULT);
  return <Ctx.Provider value={{ names, set: (n) => setNames((p) => ({ ...p, ...n })) }}>{children}</Ctx.Provider>;
}
export const useNames = () => useContext(Ctx);

/** Under the hero envelope: type your names and the invitation inside changes. */
export function NamesInline() {
  const { names, set } = useNames();
  const field = "h-11 w-full min-w-0 rounded-md border border-white/25 bg-white/10 px-3 text-center font-serif text-lg text-white placeholder:text-white/50 outline-none transition focus:border-[#e6cf93]";
  return (
    <div className="mx-auto mt-4 grid max-w-[26rem] gap-2">
      <p className="text-center text-xs uppercase tracking-[0.24em] text-white/60">Try it with your names</p>
      <div className="grid grid-cols-2 gap-2">
        <input id="v2-one" aria-label="Your name" className={field} value={names.one} onChange={(e) => set({ one: e.target.value })} maxLength={20} />
        <input id="v2-two" aria-label="Your partner's name" className={field} value={names.two} onChange={(e) => set({ two: e.target.value })} maxLength={20} />
      </div>
    </div>
  );
}
