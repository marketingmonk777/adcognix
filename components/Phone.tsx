export function Phone({ children, title, className = '' }: { children: React.ReactNode; title?: string; className?: string }) {
  return (<div className={'phone ' + className} aria-hidden="true"><div className="phone-notch" />
    {title && <div className="phone-bar">{title}</div>}<div className="phone-body">{children}</div></div>);
}
