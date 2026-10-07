import numpy as np, sys
sys.path.insert(0,'/home/claude/src')
from mesh import *
R=85.0  # trunk radius mm (~170 mm dia mature arecanut)
COL=dict(trunk=(0.62,0.60,0.48),scar=(0.50,0.48,0.38),pod=(0.18,0.20,0.22),strap=(0.10,0.10,0.10),
 hub=(0.86,0.87,0.88),lid=(0.20,0.42,0.26),conn=(0.55,0.56,0.58),ae=(0.32,0.42,0.52),pin=(0.80,0.80,0.82),
 solar=(0.10,0.16,0.35),arm=(0.60,0.60,0.62),cable=(0.08,0.08,0.08),ground=(0.55,0.45,0.32),dend=(0.75,0.65,0.25))
def pod(m,a,z,label_pin=True):
    """Electrode pod: curved base conforming to trunk, cover, Ti pin electrode, temp sensor"""
    w=40/R
    sector(m,R+0.5,R+10,a-w/2,a+w/2,z-18,z+18,COL['pod'])
    # cover block
    Rz=rotz(a)
    box(m,(R+17,0,z),(14,30,28),COL['pod'],R=Rz)
    # cable gland nub
    p0=np.array(polar(R+17,a,z-14));cyl(m,p0,p0+[0,0,-10],4,COL['conn'],16)
    # electrode pin into trunk (visible stub) and PT1000 button
    for dz,col,rr,depth in((6,COL['pin'],0.6,7),(-8,COL['conn'],2.0,1)):
        cyl(m,polar(R+0.6,a,z+dz),polar(R-depth,a,z+dz),rr,col,12)
def band(m,z,angles=(0,np.pi),buckle=-np.pi/2):
    ring(m,R+0.2,R+2.2,z-10,z+10,COL['strap'],72)
    for a in angles: pod(m,a,z)
    # buckle
    box(m,(R+5,0,z),(6,18,24),COL['conn'],R=rotz(buckle))
def ae_sentinel(m,a,z):
    w=46/R
    sector(m,R+0.5,R+8,a-w/2,a+w/2,z-22,z+22,COL['ae'])
    ring(m,R+0.2,R+2.0,z-8,z+8,COL['strap'],72)
    cyl(m,polar(R+8,a,z),polar(R+44,a,z),16,COL['ae'],32)
    cyl(m,polar(R+44,a,z),polar(R+50,a,z),12,COL['conn'],24)   # spring cap
    cyl(m,polar(R+50,a,z),polar(R+60,a,z),4,COL['conn'],12)    # cable gland
    cyl(m,polar(R+0.6,a,z),polar(R-0.2,a,z),6.5,COL['pin'],24)  # wear plate face
def hub(m,a,z,solar=True):
    Rz=rotz(a); w=120/R
    # saddle
    sector(m,R+0.5,R+12,a-w/2,a+w/2,z-55,z+55,COL['arm'])
    for dz in(-40,40): ring(m,R+0.2,R+2.4,z+dz-12,z+dz+12,COL['strap'],72)
    # body + lid (local: x radial, y tangential)
    box(m,(R+12+28,0,z),(56,160,110),COL['hub'],R=Rz)
    box(m,(R+12+56+4,0,z),(8,164,114),COL['lid'],R=Rz)
    for sy in(-74,74):
        for sz in(-50,50): cyl(m,np.array(polar(R+76,a,z))+Rz@[0,sy,sz],np.array(polar(R+77.5,a,z))+Rz@[0,sy,sz],3,COL['conn'],10)
    # 6 M12 connectors on bottom face
    for i,sy in enumerate(np.linspace(-62,62,6)):
        p=np.array(polar(R+40,a,z-55))+Rz@[0,sy,0]
        cyl(m,p,p+[0,0,-16],7,COL['conn'],20)
    # status window / LED
    box(m,(R+76.2,50,z+35),(0.6,24,10),(0.25,0.75,0.45),R=Rz)
    # antenna
    p=np.array(polar(R+40,a,z+55))+Rz@[0,60,0]
    cyl(m,p,p+[0,0,14],6,COL['conn'],16); cyl(m,p+[0,0,14],p+[0,0,130],5,COL['strap'],16)
    if solar:
        p=np.array(polar(R+40,a,z+55))+Rz@[0,-40,0]
        top=p+[0,0,150]+Rz@[40,0,0]
        tube(m,[p,p+[0,0,150],top],5,COL['arm'],12)
        tilt=rotx(0)  # panel tilted 25 deg away from trunk
        c=np.cos(np.radians(25));s=np.sin(np.radians(25))
        Rt=Rz@np.array([[c,0,s],[0,1,0],[-s,0,c]])
        box(m,(0,0,0),(170,230,6),COL['solar'],R=Rt,T=top+Rz@[60,0,25])
def dendro(m,z,a):
    ring(m,R+0.0,R+0.8,z-4,z+4,COL['dend'],96)
    box(m,(R+9,0,z),(16,34,22),COL['pod'],R=rotz(a))
def trunk(m,z0,z1):
    cyl(m,[0,0,z0],[0,0,z1],R,COL['trunk'],72)
    for z in np.arange(z0+60,z1-20,110): ring(m,R-0.2,R+0.9,z-2.5,z+2.5,COL['scar'],72)

def shifted(m,builder,off):
    t=Mesh(); builder(t)
    for V,F,c in zip(t.V,t.F,[None]*len(t.V)): pass
    o=0
    for V,F in zip(t.V,t.F):
        n=len(F); cols=t.C[o:o+n]; o+=n
        m.add(V+np.array(off),F-F.min(),cols[0])
def helix(m,r,x0,x1,turns,wire,color):
    th=np.linspace(0,2*np.pi*turns,turns*24); x=np.linspace(x0,x1,len(th))
    pts=[np.array([xx,r*np.cos(t),r*np.sin(t)]) for xx,t in zip(x,th)]
    tube(m,pts,wire,color,6)
PCB=(0.12,0.45,0.22); PZT=(0.85,0.55,0.20); SS=(0.78,0.79,0.80)
def pod_exploded(m,gap=26):
    # radial axis = +x ; trunk surface patch at x=0 (angle 0, R)
    sector(m,R-14,R,-0.42,0.42,-40,40,COL['trunk'],24)                     # trunk wedge for context
    shifted(m,lambda t:(cyl(t,[R-7,0,6],[R+12,0,6],0.8,SS,12),cyl(t,[R+10,0,6],[R+12,0,6],2.2,SS,16)),(gap*0.6,0,0))   # Ti pin
    shifted(m,lambda t:cyl(t,[R-0.5,0,-8],[R+3,0,-8],2.0,COL['conn'],16),(gap*0.6,0,0))  # PT1000 button
    shifted(m,lambda t:sector(t,R+0.5,R+8,-20/R,20/R,-18,18,COL['pod'],20),(gap*1.4,0,0))   # curved base
    shifted(m,lambda t:box(t,(R+9,0,0),(1.2,34,30),(0.30,0.30,0.32)),(gap*2.0,0,0))           # gasket
    def pcb(t):
        box(t,(R+11,0,0),(1.6,30,26),PCB)
        for (yy,zz,s) in((-6,4,6),(7,-5,5),(6,7,3),(-8,-7,4)): box(t,(R+12.6,yy,zz),(1.6,s,s),(0.1,0.1,0.1))
    shifted(m,pcb,(gap*2.6,0,0))
    shifted(m,lambda t:(box(t,(R+19,0,0),(14,30,28),COL['pod']),cyl(t,[R+19,0,-14],[R+19,0,-26],4,COL['conn'],16)),(gap*3.4,0,0))
    shifted(m,lambda t:sector(t,R+0.2,R+2.2,-0.9,0.9,-10,10,COL['strap'],24),(gap*1.4,0,0))
def ae_exploded(m,gap=22):
    sector(m,R-14,R,-0.42,0.42,-40,40,COL['trunk'],24)
    X=R
    shifted(m,lambda t:sector(t,R+0.5,R+8,-23/R,23/R,-22,22,COL['ae'],20),(gap*0.5,0,0))          # saddle
    shifted(m,lambda t:cyl(t,[X,0,0],[X+1,0,0],6.5,SS,24),(gap*1.6,0,0))                            # wear plate
    shifted(m,lambda t:cyl(t,[X,0,0],[X+1,0,0],5,PZT,24),(gap*2.3,0,0))                              # PZT disc
    shifted(m,lambda t:cyl(t,[X,0,0],[X+6,0,0],6,(0.15,0.15,0.15),24),(gap*3.0,0,0))                 # backing
    shifted(m,lambda t:helix(t,6,X,X+12,5,0.7,SS),(gap*3.8,0,0))                                      # spring
    shifted(m,lambda t:cyl(t,[X,0,0],[X+1.6,0,0],11,PCB,28),(gap*4.6,0,0))                            # preamp PCB
    shifted(m,lambda t:cyl(t,[X,0,0],[X+36,0,0],16,COL['ae'],32),(gap*5.2,0,0))                        # housing
    shifted(m,lambda t:(cyl(t,[X,0,0],[X+6,0,0],12,COL['conn'],24),cyl(t,[X+6,0,0],[X+16,0,0],4,COL['conn'],12)),(gap*5.2+40,0,0))
