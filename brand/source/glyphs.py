# text -> SVG path using fontTools (variable font instanced)
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
import functools, os
FD=os.path.join(os.path.dirname(__file__),'..','brand','fonts')
@functools.lru_cache(None)
def font(name,w):
    f=TTFont(os.path.join(FD,name+'.ttf'))
    axes={'wght':w}
    if 'opsz' in [a.axisTag for a in f['fvar'].axes]: axes['opsz']=14 if name=='Inter' else None
    axes={k:v for k,v in axes.items() if v is not None}
    return instantiateVariableFont(f,axes)
def text_path(s,size,x=0,y=0,name='Manrope',w=700,track=0):
    f=font(name,w); gs=f.getGlyphSet(); cmap=f.getBestCmap(); upm=f['head'].unitsPerEm
    sc=size/upm; d=[]; cx=x
    for ch in s:
        g=cmap.get(ord(ch)); 
        if not g: cx+=size*0.3; continue
        pen=SVGPathPen(gs); tp=TransformPen(pen,(sc,0,0,-sc,cx,y)); gs[g].draw(tp)
        d.append(pen.getCommands()); cx+=gs[g].width*sc+track*size
    return ' '.join(d), cx-x-track*size
