export function LicensePlate({ plate }: { plate: string }) {
  return (
    <span className="inline-flex items-center rounded border border-slate-300 bg-white text-slate-900 font-mono text-sm font-bold tracking-wider">
      <span className="bg-blue-700 text-white text-[10px] px-1 py-0.5 rounded-l flex items-center justify-center leading-none">
        P
      </span>
      <span className="px-2 py-0.5">{plate}</span>
    </span>
  );
}
