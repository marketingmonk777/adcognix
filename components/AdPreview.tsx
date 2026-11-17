'use client';
import { renderSvg, type TplVars } from '@/lib/templates';
import { PlatformIcon } from './Icons';
import type { AdCopy } from '@/lib/types';
export function Svg({ svg, className, label }: { svg: string; className?: string; label?: string }) {
  return <div className={'svgbox ' + (className || '')} role="img" aria-label={label || 'Ad creative'} dangerouslySetInnerHTML={{ __html: svg }} />;
}
export function FeedPreview({ tpl, v, copy, name, platform = 'facebook', logo }: { tpl: string; v: TplVars; copy: AdCopy; name: string; platform?: 'facebook' | 'instagram'; logo?: string }) {
  return (<div className="feed-prev">
    <div className="fp-head"><span className="fp-av">{logo ? <img src={logo} alt="" /> : name[0]}</span><span><b>{name}</b><i>Sponsored · <PlatformIcon p={platform} size={11} /></i></span></div>
    {platform === 'facebook' && <p className="fp-text">{copy.primary[0]}</p>}
    <Svg svg={renderSvg(tpl, v, 1080, 1080)} />
    <div className="fp-cta"><span><i>{(v.city || '').toUpperCase()}</i><b>{copy.headlines[0]}</b></span><span className="fp-btn">{copy.cta}</span></div>
    {platform === 'instagram' && <p className="fp-text"><b>{name}</b> {copy.primary[0]} <span className="fp-tags">{copy.hashtags.slice(0, 4).join(' ')}</span></p>}
  </div>);
}
export function StoryPreview({ tpl, v, copy, name }: { tpl: string; v: TplVars; copy: AdCopy; name: string }) {
  return (<div className="story-prev"><Svg svg={renderSvg(tpl, v, 1080, 1920)} />
    <div className="sp-top"><span className="sp-bar"><span /></span><span className="sp-name"><span className="fp-av sm">{name[0]}</span>{name} · Sponsored</span></div>
    <div className="sp-cta">{copy.cta}</div></div>);
}
export function SearchPreview({ copy, name, site }: { copy: AdCopy; name: string; site?: string }) {
  const host = (site || '').replace(/^https?:\/\//, '').replace(/\/.*$/, '') || name.toLowerCase().replace(/[^a-z0-9]+/g, '') + '.in';
  return (<div className="search-prev"><div className="sr-sp">Sponsored</div><div className="sr-site"><span className="fp-av sm">{name[0]}</span><span><b>{name}</b><i>{host}</i></span></div>
    <div className="sr-h">{copy.headlines.slice(0, 3).join(' | ')}</div><div className="sr-d">{copy.descriptions.join(' ')}</div></div>);
}
