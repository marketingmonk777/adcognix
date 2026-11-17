# End-to-end smoke test (demo mode). Run: python3 tests/e2e.py [base_url]
import sys
from playwright.sync_api import sync_playwright
B = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8790/adcognix'
errs, fails = [], []
def ok(c, m): (None if c else fails.append(m)); print(('PASS ' if c else 'FAIL ') + m)
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(viewport={'width': 1280, 'height': 860})
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(B + '/'); ok('Ads that think ahead' in pg.content(), 'landing renders')
    pg.screenshot(path='/tmp/acx-home.png', full_page=False)
    pg.click('text=Request a call'); ok(pg.is_visible('text=Enter your business name'), 'consult form validates')
    pg.fill('#cb', 'Sharma Interiors'); pg.fill('#cp', '9845012345'); pg.click('text=Request a call')
    pg.wait_for_selector('text=we have your details'); ok(True, 'consult request saved')
    pg.goto(B + '/app/'); pg.wait_for_url('**/login/'); ok(True, 'app redirects to login when signed out')
    pg.fill('#em', 'bad'); pg.click('button:has-text("Continue")'); ok(pg.is_visible('text=valid email'), 'email validated')
    pg.fill('#em', 'owner@sharma.in'); pg.click('button:has-text("Continue")'); pg.wait_for_url('**/onboarding/')
    pg.click('text=Continue'); ok(pg.is_visible('text=Pick a category'), 'onboarding step 1 validates')
    pg.fill('#n', 'Sharma Interiors'); pg.select_option('#c', 'Interiors & home services'); pg.fill('#ci', 'Bengaluru'); pg.click('text=Continue')
    pg.fill('#p', '9845012345'); pg.click('text=Continue'); pg.fill('#b', '20000'); pg.click('text=Finish setup')
    pg.wait_for_url('**/app/'); pg.wait_for_selector('text=Suggested channel split'); ok('Google Search' in pg.content(), 'dashboard shows split')
    pg.screenshot(path='/tmp/acx-dash.png')
    pg.click('.side >> text=Settings'); pg.wait_for_selector('text=AI provider'); pg.select_option('#ap', 'groq'); pg.click('text=Save AI settings'); pg.wait_for_selector('text=AI settings saved')
    pg.fill('#ci', 'Mysuru'); pg.click('text=Save profile'); pg.wait_for_selector('text=Profile saved')
    pg.fill('#k', 'sb_secret_abc'); pg.fill('#u', 'https://abcd.supabase.co'); pg.click('button:has-text("Connect")'); ok(pg.is_visible('text=That is a secret key'), 'secret key rejected')
    pg.screenshot(path='/tmp/acx-settings.png', full_page=True)
    pg.goto(B + '/app/'); pg.wait_for_selector('text=Suggested channel split'); ok('Mysuru' in pg.content(), 'profile persisted')
    ok(pg.locator('text=Done').count() >= 2, 'AI checklist done')
    pg.goto(B + '/admin/'); pg.wait_for_selector('text=Callback requests'); ok(pg.is_visible('text=9845012345') or pg.is_visible('text=+919845012345'), 'admin sees consult request')
    m = br.new_page(viewport={'width': 390, 'height': 844}); m.on('pageerror', lambda e: errs.append(str(e)))
    for path in ['/', '/login/', '/privacy/']:
        m.goto(B + path); w = m.evaluate('document.documentElement.scrollWidth'); ok(w <= 390, f'mobile no overflow {path} ({w})')
    m.goto(B + '/'); m.screenshot(path='/tmp/acx-mobile.png')
    br.close()
ok(not errs, 'no page errors ' + '; '.join(errs[:3]))
sys.exit(1 if fails else 0)
