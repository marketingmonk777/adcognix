import os,sys,cairosvg
sys.path.insert(0,os.path.dirname(__file__))
from glyphs import text_path
B=os.path.join(os.path.dirname(__file__),'..','brand')
C=dict(navy='#0B1B3F',cobalt='#2F5BFF',coral='#FF6B4A',mint='#14B88F',paper='#F7F8FB',ink='#0E1525',slate='#5B6478',line='#E3E6EE',white='#FFFFFF')
def mark(x=0,y=0,s=64,fg=C['cobalt'],dot=C['coral']):
    k=s/64
    return (f'<g transform="translate({x},{y}) scale({k})">'
      f'<path d="M13 51 L32 13 L51 51" fill="none" stroke="{fg}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>'
      f'<circle cx="32" cy="40.5" r="5.6" fill="{dot}"/></g>')
def word(x,y,size,fill):
    d,w=text_path('AdCognix',size,x,y,'Manrope',750,-0.02)
    return f'<path d="{d}" fill="{fill}"/>',w
def svg(w,h,body,bg=None):
    r=f'<rect width="{w}" height="{h}" fill="{bg}"/>' if bg else ''
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">{r}{body}</svg>'
def save(rel,s,png=None):
    p=os.path.join(B,rel); os.makedirs(os.path.dirname(p),exist_ok=True)
    open(p,'w').write(s)
    for W in (png or []):
        cairosvg.svg2png(bytestring=s.encode(),write_to=p.replace('.svg',f'-{W}.png') if len(png)>1 else p.replace('.svg','.png'),output_width=W)
def lockup(fg_word,fg=C['cobalt'],dot=C['coral'],bg=None):
    t,w=word(0,0,100,fg_word)
    body=mark(0,0,120,fg,dot)+f'<g transform="translate(150,96)">{t}</g>'
    return svg(int(150+w+10),120,body,bg)
def stacked(fg_word,fg=C['cobalt'],dot=C['coral'],bg=None):
    t,w=word(0,0,64,fg_word); W=int(max(w,140)+40)
    body=mark((W-140)/2,0,140,fg,dot)+f'<g transform="translate({(W-w)/2},210)">{t}</g>'
    return svg(W,235,body,bg)
if __name__=='__main__':
    save('logo/svg/adcognix-mark.svg',svg(64,64,mark()),[64,128,256,512,1024])
    save('logo/svg/adcognix-mark-white.svg',svg(64,64,mark(fg=C['white'],dot=C['coral'])),[512])
    save('logo/svg/adcognix-mark-mono.svg',svg(64,64,mark(fg=C['ink'],dot=C['ink'])),[512])
    save('logo/svg/adcognix-logo.svg',lockup(C['ink']),[800,1600])
    save('logo/svg/adcognix-logo-on-dark.svg',lockup(C['white'],C['white']),[800,1600])
    save('logo/svg/adcognix-logo-mono.svg',lockup(C['ink'],C['ink'],C['ink']),[1600])
    save('logo/svg/adcognix-logo-stacked.svg',stacked(C['ink']),[1000])
    t,w=word(0,100,100,C['ink']); save('logo/svg/adcognix-wordmark.svg',svg(int(w+4),125,t),[1600])
    # preview sheet
    pv=svg(1400,700,f'<rect width="700" height="700" fill="{C["paper"]}"/><rect x="700" width="700" height="700" fill="{C["navy"]}"/>'
      +f'<g transform="translate(60,120) scale(.62)">{lockup(C["ink"])[lockup(C["ink"]).index(">")+1:-6]}</g>'
      +f'<g transform="translate(760,120) scale(.62)">{lockup(C["white"],C["white"])[lockup(C["white"]).index(">")+1:-6]}</g>'
      +mark(250,330,200)+mark(950,330,200,C['white']))
    cairosvg.svg2png(bytestring=pv.encode(),write_to='/workspace/work/adcognix-preview.png')
