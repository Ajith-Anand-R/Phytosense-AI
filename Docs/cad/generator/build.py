import numpy as np, sys
sys.path.insert(0,'/home/claude/src')
from mesh import *; from parts import *; from raster import figure
D=np.radians
H={'N1':300,'N2':800,'N3':1300,'N4':1800}; PODA=(D(-30),D(150)); HUBA=D(-100); AEA=D(-62); HUBZ=1050
def cables(m):
    hubconn=[np.array(polar(R+40,HUBA,HUBZ-55))+rotz(HUBA)@[0,sy,-16] for sy in np.linspace(-62,62,6)]
    srcs=[(polar(R+17,PODA[0],H[k]-24),PODA[0]) for k in H]+[(polar(R+60,AEA,z),AEA) for z in(550,1550)]
    for i,((p,a),c) in enumerate(zip(srcs,hubconn+hubconn)):
        rr=R+5+ (i%3)*2.5; zr=HUBZ-90-(i%6)*6
        pts=[np.array(p)]
        if p[2]<zr or True:
            pts.append(np.array(polar(rr,a,p[2]-10 if p[2]>zr else p[2]-6)))
        pts.append(np.array(polar(rr,a,zr)))
        for t in np.linspace(a,HUBA+ (c[0]*0),8)[1:]: pts.append(np.array(polar(rr+8,t,zr)))
        pts.append(np.array([c[0],c[1],zr])); pts.append(c)
        tube(m,pts,2.6,COL['cable'],8)
def assembly(with_cables=True):
    m=Mesh(); trunk(m,0,2150)
    for z in H.values(): band(m,z,PODA)
    for z in(550,1550): ae_sentinel(m,AEA,z)
    hub(m,HUBA,HUBZ); dendro(m,1180,D(-150))
    if with_cables: cables(m)
    # ground patch
    sector(m,R,300,0,2*np.pi,-6,0,COL['ground'],48)
    return m
m=assembly()
print('assembly tris',write_stl(m,'/home/claude/cad/stl/phytohydra_assembly_on_trunk.stl'))
L=[(polar(R+30,PODA[0],H['N4']),'N4 stem band (1.8 m)\n2 electrode pods, opposite sides'),
   (polar(R+30,PODA[0],H['N3']),'N3 stem band (1.3 m)'),
   (polar(R+60,AEA,1550),'Acoustic Sentinel (upper)'),
   (np.array(polar(R+60,HUBA,HUBZ+200))+rotz(HUBA)@[60,0,0],'6 W solar panel on arm'),
   (polar(R+76,HUBA,HUBZ),'Edge Hub, IP67\n160 x 110 x 68 mm'),
   (polar(R+1,D(-75),1180),'Micro-dendrometer band'),
   (polar(R+30,PODA[0],H['N2']),'N2 stem band (0.8 m)'),
   (polar(R+60,AEA,550),'Acoustic Sentinel (lower)'),
   (polar(R+30,PODA[0],H['N1']),'N1 stem band (0.3 m)')]
figure(m,'/home/claude/cad/render/01_assembly_on_palm.png','PhytoHydra v1 installed on an arecanut palm',labels=L,az=-75,el=10,W=620,H=1500,lim=([-320,-320,-10],[320,320,2160]),img_frac=0.5,note='Trunk dia 170 mm (typical mature palm). Band heights for a mature palm; seedling rig uses 5/15/25/35 cm.')
# close-up of hub region
figure(m,'/home/claude/cad/render/02_hub_closeup.png','Edge Hub, solar arm and cable loom (close-up)',az=-70,el=14,W=1100,H=1200,lim=([-260,-330,900],[160,60,1420]),
  labels=[(polar(R+76,HUBA,HUBZ+20),'Lid with gasket (green)'),(np.array(polar(R+40,HUBA,HUBZ-70)),'6 x M12 connectors\n(4 bands, 2 AE)'),(polar(R+6,HUBA+0.6,HUBZ-40),'Stainless band clamps\n+ curved saddle'),(np.array(polar(R+40,HUBA,HUBZ+190))+rotz(HUBA)@[0,60,0],'LoRa antenna, 865-867 MHz')])
# single parts
p=Mesh(); ring(p,R-0.01,R,0,1,(1,1,1),4)  # dummy tiny
p=Mesh(); band(p,0,(0,np.pi)); cyl(p,[0,0,-60],[0,0,60],R-0.5,COL['trunk'],72)
figure(p,'/home/claude/cad/render/03_stem_band.png','Stem Interface Band: 2 electrode pods on a TPU strap',az=-30,el=22,W=1100,H=900,lim=([-130,-130,-60],[130,130,60]),
  labels=[(polar(R+24,0,6),'Electrode pod (40 x 36 mm)\nTi micro-pin + PT1000 inside'),(polar(R+2,np.pi/2,0),'Over-centre buckle'),(polar(R+2,-np.pi/2,8),'TPU strap, 20 mm wide')])
q=Mesh(); pod(q,0,0); write_stl(q,'/home/claude/cad/stl/electrode_pod.stl')
q=Mesh(); band(q,0,(0,np.pi)); write_stl(q,'/home/claude/cad/stl/stem_band_with_2_pods.stl')
q=Mesh(); ae_sentinel(q,0,0); write_stl(q,'/home/claude/cad/stl/acoustic_sentinel.stl')
r=Mesh(); ae_sentinel(r,0,0); cyl(r,[0,0,-50],[0,0,50],R-0.5,COL['trunk'],72)
figure(r,'/home/claude/cad/render/04_acoustic_sentinel.png','Acoustic Sentinel: spring-loaded piezo on a curved saddle',az=-35,el=18,W=1100,H=900,lim=([-60,-120,-60],[170,110,60]),
  labels=[(polar(R+44,0,16),'Housing, 32 mm OD\npreamp PCB inside'),(polar(R+50,0,10),'Spring cap (sets contact force)'),(polar(R+60,0,0),'Cable gland'),(polar(R+8,0.25,-20),'Curved saddle, R85')])
q=Mesh(); hub(q,0,0); write_stl(q,'/home/claude/cad/stl/edge_hub_with_solar.stl')
print('done')
