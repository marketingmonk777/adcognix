'use client';
import { useEffect, useState } from 'react';
let push: (m: string) => void = () => {};
export const toast = (m: string) => push(m);
export function Toaster() {
  const [m, setM] = useState<string | null>(null);
  useEffect(() => { push = (x) => { setM(x); setTimeout(() => setM(null), 2800); }; }, []);
  return m ? <div className="toast" role="status">{m}</div> : null;
}
