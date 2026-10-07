import numpy as np, sys
sys.path.insert(0,'/home/claude/src')
from mesh import *; from parts import *; from raster import figure
D=np.radians
p=Mesh(); band(p,0,(0,np.pi),buckle=-np.pi/2); cyl(p,[0,0,-70],[0,0,70],R-0.5,COL['trunk'],72)
figure(p,'/home/claude/cad/render/03_stem_band.png','Stem Interface Band: two electrode pods, 180 degrees apart',az=-90,el=28,W=1000,H=760,lim=([-135,-135,-70],[135,135,70]),img_frac=0.6,
  labels=[(polar(R+24,np.pi,4),'Pod A (west side)'),(polar(R+24,0,4),'Pod B (east side)\n40 x 36 mm, Ti pin + PT1000'),(polar(R+8,-np.pi/2,10),'Over-centre buckle\n(tension sets contact)'),(polar(R+2,-np.pi/2-0.6,8),'TPU strap, 20 mm wide')])
q=Mesh(); pod_exploded(q); write_stl(q,'/home/claude/cad/stl/electrode_pod_exploded.stl')
g=26
figure(q,'/home/claude/cad/render/05_pod_exploded.png','Electrode pod, exploded (radial axis left to right)',az=-90,el=18,W=1200,H=620,img_frac=0.66,
  labels=[(np.array([R-7+g*.6,0,6]),'1  Ti micro-pin, 1 mm,\n    5-8 mm into outer trunk'),(np.array([R+1+g*.6,0,-8]),'2  PT1000 stem temperature'),(np.array([R+8+g*1.4,0,14]),'3  Curved base, R85 (PA12 / ASA)'),
          (np.array([R+9+g*2,0,-12]),'4  Silicone gasket'),(np.array([R+12+g*2.6,0,8]),'5  Pod PCB: buffer amp, mux,\n    ID EEPROM, TVS protection'),(np.array([R+26+g*3.4,0,8]),'6  Cover + M8 4-pin connector'),(np.array([R+2+g*1.4,30,-8]),'7  TPU strap')])
a=Mesh(); ae_exploded(a); write_stl(a,'/home/claude/cad/stl/acoustic_sentinel_exploded.stl')
g=22
figure(a,'/home/claude/cad/render/06_ae_exploded.png','Acoustic Sentinel, exploded (radial axis left to right)',az=-90,el=16,W=1300,H=560,img_frac=0.68,
  labels=[(np.array([R+8+g*.5,0,16]),'1  Curved saddle + strap'),(np.array([R+1+g*1.6,0,6]),'2  SS wear plate + couplant'),(np.array([R+1+g*2.3,0,4]),'3  PZT disc, 10 mm, ~200 kHz'),
          (np.array([R+6+g*3.0,0,5]),'4  Tungsten-epoxy backing'),(np.array([R+6+g*3.8,0,6]),'5  Spring (sets contact force)'),(np.array([R+1.6+g*4.6,0,10]),'6  40 dB preamp PCB'),(np.array([R+20+g*5.2,0,16]),'7  Housing, 32 mm OD'),(np.array([R+50+g*5.2,0,4]),'8  Cap + cable gland')])
print('ok')
