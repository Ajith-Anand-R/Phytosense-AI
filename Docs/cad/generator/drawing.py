import matplotlib; matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle, Arc, Circle, FancyArrowPatch, Polygon
import numpy as np
fig=plt.figure(figsize=(16.5,11.7),dpi=130); fig.patch.set_facecolor('white')
INK='#1d2b22'; DIM='#2a5db0'
def dim(ax,p0,p1,txt,off=(0,0),fs=8):
    ax.annotate('',xy=p1,xytext=p0,arrowprops=dict(arrowstyle='<->',color=DIM,lw=0.8))
    ax.text((p0[0]+p1[0])/2+off[0],(p0[1]+p1[1])/2+off[1],txt,color=DIM,fontsize=fs,ha='center',va='center',bbox=dict(fc='white',ec='none',pad=0.5))
def panel(rect,title,xl,yl):
    ax=fig.add_axes(rect); ax.set_aspect('equal'); ax.set_xlim(*xl); ax.set_ylim(*yl); ax.axis('off')
    ax.set_title(title,fontsize=10.5,color=INK,loc='left',fontweight='bold'); return ax
# frame + title block
fa=fig.add_axes([0,0,1,1]); fa.axis('off'); fa.set_xlim(0,1); fa.set_ylim(0,1)
fa.add_patch(Rectangle((0.01,0.01),0.98,0.98,fill=False,lw=1.6,ec=INK))
fa.add_patch(Rectangle((0.66,0.01),0.33,0.085,fill=False,lw=1.0,ec=INK))
fa.text(0.67,0.075,'PhytoSense AI  |  PhytoHydra v1 prototype',fontsize=11,fontweight='bold',color=INK)
fa.text(0.67,0.052,'Drawing PH-ME-001 rev A  |  Key mechanical dimensions',fontsize=9,color=INK)
fa.text(0.67,0.030,'Units: mm  |  Scale: NTS  |  Date: 2026-10-07  |  Status: design intent, not yet built',fontsize=8,color='#555')
fa.text(0.02,0.965,'PhytoHydra v1  -  mechanical drawing sheet',fontsize=15,fontweight='bold',color=INK)
# 1 elevation of trunk with sensor heights
ax=panel([0.02,0.10,0.20,0.83],'A  Installation elevation',( -260,300),(-120,2250))
ax.add_patch(Rectangle((-85,0),170,2150,fc='#e9e6d6',ec=INK,lw=1)); ax.plot([-250,290],[0,0],color='#7a5b3a',lw=2)
for k,(z,n) in enumerate(((300,'N1'),(800,'N2'),(1300,'N3'),(1800,'N4'))):
    ax.add_patch(Rectangle((-88,z-10),176,20,fc='#222',ec='none')); ax.add_patch(Rectangle((85,z-18),24,36,fc='#333')); ax.add_patch(Rectangle((-109,z-18),24,36,fc='#333'))
    ax.text(-120,z,n,ha='right',va='center',fontsize=9,color=INK)
    xx=130+k*42; dim(ax,(xx,0),(xx,z),f'{z}',off=(0,z/2-40 if False else 0)); ax.texts[-1].set_position((xx,z+45))
for z in(550,1550): ax.add_patch(Circle((0,z),16,fc='#516b85',ec=INK)); ax.text(-120,z,'AE',ha='right',va='center',fontsize=8.5,color='#516b85')
ax.add_patch(Rectangle((-80,995),160,110,fc='#cfd3d6',ec=INK)); ax.text(0,1050,'HUB',ha='center',va='center',fontsize=8,fontweight='bold')
ax.plot([-90,90],[1180,1180],color='#c9a227',lw=2); ax.text(-120,1180,'DEND',ha='right',va='center',fontsize=7.5,color='#9a7b10')
dim(ax,(-85,2200),(85,2200),'dia 170 (typ.)',off=(0,40))
ax.text(-250,-90,'Seedling rig: N1-N4 at 50/150/250/350 mm',fontsize=7.5,color='#555')
# 2 electrode pod: front + top section
ax=panel([0.24,0.55,0.20,0.38],'B  Electrode pod  (front / top section)',(-40,70),(-70,40))
ax.add_patch(Rectangle((-20,-18),40,36,fc='#d7d9db',ec=INK)); ax.add_patch(Circle((0,6),0.9,fc=INK)); ax.add_patch(Circle((0,-8),2.1,fill=False,ec=INK))
for y in(-16,16):
    for z in(-14,14): ax.add_patch(Circle((y,z),0.85,fc=INK))
dim(ax,(-20,22),(20,22),'40'); dim(ax,(-25,-18),(-25,18),'36',off=(-5,0))
ax.text(3,6,'Ti pin dia 1.0',fontsize=7,va='center'); ax.text(3,-8,'PT1000 dia 4',fontsize=7,va='center')
# top section: arc + slab
th=np.linspace(-0.30,0.30,40); r=85; cx,cy=40,-150
ax.plot(cx+0*th,cy+0*th,alpha=0)
yy=-35; ax.add_patch(Rectangle((25,yy-30),40,9.5+14,fc='#d7d9db',ec=INK))
ax.plot(np.linspace(25,65,50),yy-30+0*np.linspace(0,1,50),color='#7a6a45',lw=2)
ax.text(45,yy-36,'trunk side, R85 concave',fontsize=6.8,ha='center',color='#7a6a45')
dim(ax,(68,yy-30),(68,yy-30+23.5),'23.5',off=(7,0)); ax.plot([45,45],[yy-30,yy-37],color=INK,lw=1.2)
ax.text(45,yy-6,'base 9.5 + cover 14',fontsize=6.8,ha='center')
# 3 acoustic sentinel section
ax=panel([0.46,0.55,0.25,0.38],'C  Acoustic Sentinel  (axial section)',(-10,80),(-35,35))
ax.add_patch(Rectangle((0,-22),8,44,fc='#c9d3dc',ec=INK))
ax.add_patch(Rectangle((8,-16),38,32,fc='#e3e8ed',ec=INK)); ax.add_patch(Rectangle((16,-13),30,26,fc='white',ec=INK,ls='--'))
ax.add_patch(Rectangle((-1,-6.5),1,13,fc='#999',ec=INK)); ax.add_patch(Rectangle((0,-5),1,10,fc='#e08a2e',ec=INK)); ax.add_patch(Rectangle((1,-6),6,12,fc='#333'))
xs=np.linspace(8,20,200); ax.plot(xs,5*np.sin((xs-8)*2*np.pi/2.4),color='#666',lw=0.8)
ax.add_patch(Rectangle((22,-11),1.6,22,fc='#2e7d4f')); ax.add_patch(Rectangle((46,-12),6,24,fc='#888',ec=INK)); ax.add_patch(Rectangle((52,-4),10,8,fc='#888',ec=INK))
dim(ax,(8,20),(46,20),'38'); dim(ax,(70,-16),(70,16),'OD 32',off=(9,0)); dim(ax,(0,-28),(8,-28),'8')
for x,y,t in((-1,27,'wear plate + PZT'),(4,-31,'backing'),(14,-31,'spring'),(23,-31,'preamp'),(57,-31,'gland')): ax.text(x,y,t,fontsize=6.5,ha='center')
# 4 hub
ax=panel([0.73,0.55,0.25,0.38],'D  Edge Hub  (front)',(-100,110),(-110,120))
ax.add_patch(Rectangle((-80,-55),160,110,fc='#dfe2e4',ec=INK)); ax.add_patch(Rectangle((-82,-57),164,114,fill=False,ec='#2f6b3a',lw=1.5))
for i,y in enumerate(np.linspace(-62,62,6)): ax.add_patch(Rectangle((y-7,-71),14,16,fc='#8a8d90',ec=INK))
ax.add_patch(Rectangle((55,55),10,60,fc='#222')); ax.add_patch(Rectangle((50,30),24,10,fc='#3fb37a'))
dim(ax,(-80,70),(80,70),'160'); dim(ax,(-92,-55),(-92,55),'110',off=(-8,0))
ax.text(0,-90,'6 x M12 (N1-N4, AE-low, AE-high)',fontsize=7,ha='center'); ax.text(62,100,'LoRa\nantenna',fontsize=6.5,ha='left',va='center',x=68) if False else ax.text(69,95,'antenna',fontsize=6.5)
ax.text(0,0,'IP67 PC enclosure\ndepth 56 + lid 8 = 64\non R85 saddle (+12)',fontsize=7.5,ha='center',va='center')
# 5 notes / specs table
ax=fig.add_axes([0.24,0.11,0.41,0.40]); ax.axis('off')
rows=[('Item','Material / part','Key spec'),
('Electrode pin','Ti gr.2 or SS316','dia 1.0, insertion 5-8 mm, replace yearly'),
('Pod base + cover','ASA / PA12, 3D printed','UV stable, 4 x M2, silicone gasket'),
('Strap','TPU 95A, over-centre buckle','20 x 2.2 mm, 2-5 N/cm2 contact'),
('AE sensor','PZT-5A disc 10 x 1 mm','~200 kHz, SS wear plate, gel couplant'),
('AE preload spring','SS302, OD 13, wire 0.7','10-15 N on wear plate'),
('Dendrometer','Invar 0.3 mm band + AS5311','0.5 um resolution, spring tension 5 N'),
('Hub enclosure','IP67 polycarbonate','160 x 110 x 64, M12 A-coded x 6'),
('Hub saddle','ASA, 2 x SS band clamps 20 mm','R85 for 170 mm trunk (param.)'),
('Solar','6 W mono panel on 20 mm arm','25 deg tilt, south facing'),
('Cables','4-core shielded, PUR jacket','driven shield, max 2.5 m per band')]
y=0.97
for i,r in enumerate(rows):
    w='bold' if i==0 else 'normal'
    for x,t in zip((0.0,0.24,0.56),r): ax.text(x,y,t,fontsize=8.6,fontweight=w,color=INK,va='top')
    y-=0.085
    ax.plot([0,1],[y+0.02,y+0.02],color='#ccc',lw=0.6)
ax=fig.add_axes([0.66,0.11,0.32,0.40]); ax.axis('off')
notes=['NOTES','1. All trunk-contact radii are parametric (trunk_d in phytohydra_params.scad).',
'2. Excitation <10 uA RMS, <1 V, AC only, DC-blocked: no electrolysis.',
'3. Pods sit 180 deg apart so each band gives 2 sides (A/B).',
'4. AE sensors share one vertical line for arrival-time zoning.',
'5. Keep all cable exits pointing down (drip loops) in monsoon.',
'6. Mount hub on the north side of the trunk, panel on an arm',
'    clear of the frond skirt.',
'7. Rev A is design intent: fit, IP rating and contact force',
'    to be verified in Phase 0 bench tests.']
for i,t in enumerate(notes): ax.text(0,0.97-i*0.085,t,fontsize=8.6 if i else 9.5,fontweight='bold' if i==0 else 'normal',color=INK,va='top')
fig.savefig('/home/claude/cad/render/00_drawing_sheet_PH-ME-001.png',dpi=130,facecolor='white')
fig.savefig('/home/claude/cad/render/00_drawing_sheet_PH-ME-001.pdf',facecolor='white')
