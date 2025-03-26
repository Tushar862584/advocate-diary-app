import { ReactNode } from "react";

export default function AdminCasesLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="py-4">{children}</div>
    </div>
  );
}
