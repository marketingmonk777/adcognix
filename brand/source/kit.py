import os,sys,cairosvg,subprocess
sys.path.insert(0,os.path.dirname(__file__))
from brand import *
from glyphs import text_path
def T(s,size,x,y,fill,name='Inter',w=450,anchor='start',track=0):
    d,wd=text_path(s,size,0,0,name,w,track)
    if anchor=='middle': x-=wd/2
    if anchor=='end': x-=wd
    return f'<path transform="translate({x:.1f},{y:.1f})" d="{d}" fill="{fill}"/>'
def inner(s): return s[s.index('>')+1:-6]
LOGO=lambda c=C['ink'],m=C['cobalt']: inner(lockup(c,m))
LW=float(lockup(C['ink']).split('width="')[1].split('"')[0])
PHONE='+91 901 908 8160'; CITY='Bengaluru 560064'; TAG='Ads that think ahead.'
# --- app icons
def icon(s,pad=0.2,bg=C['navy'],r=0.22,fg=C['white']):
    m=s*(1-2*pad)
    return svg(s,s,f'<rect width="{s}" height="{s}" rx="{s*r}" fill="{bg}"/>'+mark(s*pad,s*pad,m,fg))
save('app-icons/ios-1024.svg',icon(1024,r=0),[1024])
save('app-icons/android-512.svg',icon(512),[512])
save('app-icons/android-adaptive-foreground.svg',svg(432,432,mark(126,126,180,C['white'])),[432])
save('app-icons/android-adaptive-background.svg',svg(432,432,'',C['navy']),[432])
save('app-icons/pwa-maskable-512.svg',icon(512,pad=0.28,r=0),[512])
save('app-icons/splash-1242x2688.svg',svg(1242,2688,mark(471,1150,300,C['white'])+T('AdCognix',72,621,1560,C['white'],'Manrope',750,'middle'),C['navy']),[1242])
fav=icon(64,pad=0.12,r=0.24); save('favicon/favicon.svg',fav,[16,32,48,180,192])
p=os.path.join(B,'favicon'); subprocess.run(['convert',f'{p}/favicon-16.png',f'{p}/favicon-32.png',f'{p}/favicon-48.png',f'{p}/favicon.ico'])
os.rename(f'{p}/favicon-180.png',f'{p}/apple-touch-icon.png')
# --- social
def cover(w,h,head,sub,scale):
    g=f'<g transform="translate({w*0.07:.0f},{h*0.5-60*scale:.0f}) scale({scale})">{LOGO(C["white"],C["white"])}</g>'
    deco=''.join(f'<circle cx="{w*0.82}" cy="{h*0.5}" r="{h*k}" fill="none" stroke="{C["cobalt"]}" stroke-opacity="{0.55-k*0.4}" stroke-width="2"/>' for k in (0.18,0.32,0.46,0.6))
    deco+=f'<circle cx="{w*0.82}" cy="{h*0.5}" r="{h*0.05}" fill="{C["coral"]}"/>'
    t=T(head,h*0.07,w*0.07,h*0.5+60*scale+h*0.13,C['white'],'Inter',400) if head else ''
    return svg(w,h,deco+g+t,C['navy'])
save('social/linkedin-cover-1584x396.svg',cover(1584,396,TAG,'',0.55),[1584])
save('social/facebook-cover-1640x624.svg',cover(1640,624,TAG,'',0.7),[1640])
save('social/youtube-banner-2560x1440.svg',cover(2560,1440,TAG,'',1.2),[2560])
save('social/twitter-header-1500x500.svg',cover(1500,500,TAG,'',0.6),[1500])
save('social/og-image-1200x630.svg',cover(1200,630,TAG,'',0.7),[1200])
save('social/profile-avatar-800.svg',svg(800,800,mark(200,200,400,C['white']),C['navy']),[800])
def post(w,h,title,body):
    s=f'<rect width="{w}" height="{h}" fill="{C["paper"]}"/><rect x="0" y="{h-12}" width="{w}" height="12" fill="{C["cobalt"]}"/>'
    s+=f'<g transform="translate(80,80) scale(.45)">{LOGO()}</g>'
    s+=T('AI ADVERTISING',22,80,h*0.42,C['coral'],'Inter',600,track=0.08)
    s+=T(title[0],w*0.072,80,h*0.42+w*0.1,C['ink'],'Manrope',750)+T(title[1],w*0.072,80,h*0.42+w*0.185,C['ink'],'Manrope',750)
    s+=T(body,28,80,h-110,C['slate'],'Inter',450)+T(PHONE,28,w-80,h-110,C['ink'],'Inter',600,'end')
    return svg(w,h,s)
save('social/templates/instagram-post-1080.svg',post(1080,1080,['Smarter ads.','Real leads.'],CITY),[1080])
save('social/templates/instagram-story-1080x1920.svg',post(1080,1920,['Launch ads','in minutes.'],CITY),[1080])
save('social/templates/linkedin-post-1200x627.svg',post(1200,627,['Ads that','think ahead.'],CITY),[1200])
# --- stationery (business card 3.5x2in @300dpi)
cw,ch=1050,600
front=svg(cw,ch,mark(cw/2-90,150,180,C['white'])+T('AdCognix',54,cw/2,430,C['white'],'Manrope',750,'middle')+T(TAG,24,cw/2,480,'#A9B4D6','Inter',400,'middle'),C['navy'])
back=svg(cw,ch,f'<rect width="{cw}" height="{ch}" fill="#fff"/>'+T('Your Name',46,80,150,C['ink'],'Manrope',750)+T('Designation',24,80,195,C['cobalt'],'Inter',600)
  +T(PHONE,26,80,390,C['ink'],'Inter',500)+T('email@yourdomain.com',26,80,435,C['ink'],'Inter',500)+T(CITY,26,80,480,C['slate'],'Inter',450)
  +mark(cw-200,ch-200,120)+f'<rect x="0" y="{ch-14}" width="{cw}" height="14" fill="{C["cobalt"]}"/>')
save('stationery/business-card-front.svg',front,[cw]); save('stationery/business-card-back.svg',back,[cw])
A4w,A4h=794,1123
lh=svg(A4w,A4h,f'<rect width="{A4w}" height="{A4h}" fill="#fff"/><g transform="translate(60,52) scale(.32)">{LOGO()}</g>'
  +T(PHONE,11,A4w-60,70,C['slate'],'Inter',450,'end')+T(CITY,11,A4w-60,88,C['slate'],'Inter',450,'end')
  +f'<rect x="60" y="110" width="{A4w-120}" height="1" fill="{C["line"]}"/><rect x="0" y="{A4h-8}" width="{A4w}" height="8" fill="{C["cobalt"]}"/>'
  +T('AdCognix  ·  '+TAG,10,60,A4h-30,C['slate'],'Inter',450))
save('stationery/letterhead-a4.svg',lh); cairosvg.svg2pdf(bytestring=lh.encode(),write_to=os.path.join(B,'stationery/letterhead-a4.pdf'))
open(os.path.join(B,'stationery/email-signature.html'),'w').write(f'''<table cellpadding="0" cellspacing="0" style="font-family:Inter,Arial,sans-serif;color:{C['ink']}"><tr><td style="padding-right:14px;border-right:2px solid {C['cobalt']}"><img src="https://YOUR-HOST/adcognix-mark-128.png" width="48" height="48" alt="AdCognix"></td><td style="padding-left:14px"><div style="font-weight:700;font-size:15px">Your Name</div><div style="font-size:13px;color:{C['cobalt']}">Designation, AdCognix</div><div style="font-size:12px;color:{C['slate']};margin-top:4px">{PHONE} · {CITY}</div></td></tr></table>''')
# --- guidelines PDF
pages=[]
def page(title,body):
    return svg(1600,900,f'<rect width="1600" height="900" fill="#fff"/>'+T(title,44,100,130,C['ink'],'Manrope',750)+body+T('AdCognix brand guidelines',14,100,850,C['slate'])+f'<rect x="100" y="160" width="60" height="4" fill="{C["cobalt"]}"/>')
pages.append(svg(1600,900,f'<g transform="translate(100,330) scale(1.3)">{LOGO(C["white"],C["white"])}</g>'+T('Brand guidelines',34,100,560,'#A9B4D6')+T(TAG,22,100,820,C['white']),C['navy']))
pages.append(page('Logo',f'<g transform="translate(100,250) scale(.9)">{LOGO()}</g><rect x="900" y="230" width="600" height="300" fill="{C["navy"]}"/><g transform="translate(960,330) scale(.5)">{LOGO(C["white"],C["white"])}</g>'
  +T('The mark is an A rising like a growth line, with an insight point at its heart.',20,100,640,C['slate'])
  +T('Clear space on every side: the height of the dot x2. Minimum size: 24 px mark, 120 px lockup.',20,100,680,C['slate'])
  +T('Do not stretch, recolour, add shadows or outlines, or rotate the logo.',20,100,720,C['slate'])))
sw=''
for i,(n,k) in enumerate([('Navy','navy'),('Cobalt','cobalt'),('Coral','coral'),('Mint','mint'),('Ink','ink'),('Slate','slate'),('Paper','paper'),('Line','line')]):
    x=100+(i%4)*360; y=230+(i//4)*290
    sw+=f'<rect x="{x}" y="{y}" width="330" height="170" rx="14" fill="{C[k]}" stroke="{C["line"]}"/>'+T(n,22,x,y+210,C['ink'],'Manrope',700)+T(C[k].upper(),18,x,y+240,C['slate'])
pages.append(page('Colour',sw))
pages.append(page('Typography',T('Manrope',90,100,330,C['ink'],'Manrope',750)+T('Headings, logo, numbers. Bold 700–800.',22,100,380,C['slate'])
  +T('Inter',90,100,560,C['ink'],'Inter',450)+T('Body, UI, tables. Regular 400, Medium 500, SemiBold 600.',22,100,610,C['slate'])
  +T('Aa Bb Cc 0123456789 ₹',40,900,330,C['cobalt'],'Manrope',750)+T('Both fonts are free (SIL Open Font License).',22,100,760,C['slate'])))
pdfs=[]
for i,pg in enumerate(pages):
    fp=f'/tmp/g{i}.pdf'; cairosvg.svg2pdf(bytestring=pg.encode(),write_to=fp); pdfs.append(fp)
    if i==1: cairosvg.svg2png(bytestring=pg.encode(),write_to='/workspace/work/adcognix-guide-p2.png',output_width=1200)
from pypdf import PdfWriter
wr=PdfWriter(); [wr.append(f) for f in pdfs]; wr.write(os.path.join(B,'AdCognix-Brand-Guidelines.pdf'))
# sheet for review
sheet=svg(1600,1000,f'<rect width="1600" height="1000" fill="#E9ECF3"/>'
 +f'<g transform="translate(40,40) scale(.5)">{inner(cover(1584,396,TAG,"",0.55))}</g>'
 +f'<g transform="translate(40,260) scale(.4)">{inner(post(1080,1080,["Smarter ads.","Real leads."],CITY))}</g>'
 +f'<g transform="translate(500,260) scale(.5)">{inner(front)}</g><g transform="translate(500,580) scale(.5)">{inner(back)}</g>'
 +f'<g transform="translate(1080,260) scale(.4)">{inner(icon(512))}</g><g transform="translate(1080,500) scale(.33)">{inner(lh)}</g>')
cairosvg.svg2png(bytestring=sheet.encode(),write_to='/workspace/work/adcognix-kit-sheet.png')
print('ok')
