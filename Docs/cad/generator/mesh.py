import numpy as np, struct
class Mesh:
    def __init__(s): s.V=[]; s.F=[]; s.C=[]
    def add(s, V, F, color):
        o=sum(len(v) for v in s.V); s.V.append(np.asarray(V,float)); s.F.append(np.asarray(F)+o); s.C += [color]*len(F)
    def merge(s, m):
        for V,F,c0 in zip(m.V, m.F, m._split_colors()): s.add(V, F - F.min() if False else F - 0, c0) if False else None
    def tris(s):
        V=np.vstack(s.V); F=np.vstack(s.F); return V[F], s.C
def box(m, c, size, color, R=None, T=(0,0,0)):
    sx,sy,sz=np.array(size)/2.
    V=np.array([[x,y,z] for x in(-sx,sx) for y in(-sy,sy) for z in(-sz,sz)])
    F=[[0,1,3],[0,3,2],[4,6,7],[4,7,5],[0,4,5],[0,5,1],[2,3,7],[2,7,6],[0,2,6],[0,6,4],[1,5,7],[1,7,3]]
    V=V+np.array(c)
    if R is not None: V=V@np.asarray(R).T
    m.add(V+np.array(T),F,color)
def rotz(a):
    c,s=np.cos(a),np.sin(a); return np.array([[c,-s,0],[s,c,0],[0,0,1]])
def rotx(a):
    c,s=np.cos(a),np.sin(a); return np.array([[1,0,0],[0,c,-s],[0,s,c]])
def cyl(m,p0,p1,r,color,n=28,r1=None):
    p0=np.array(p0,float);p1=np.array(p1,float);r1=r if r1 is None else r1
    a=p1-p0;L=np.linalg.norm(a);a/=L
    t=np.array([1,0,0]) if abs(a[0])<.9 else np.array([0,1,0])
    u=np.cross(a,t);u/=np.linalg.norm(u);w=np.cross(a,u)
    th=np.linspace(0,2*np.pi,n,endpoint=False)
    ring0=[p0+r*(np.cos(t)*u+np.sin(t)*w) for t in th]
    ring1=[p1+r1*(np.cos(t)*u+np.sin(t)*w) for t in th]
    V=np.array(ring0+ring1+[p0,p1]);F=[]
    for i in range(n):
        j=(i+1)%n; F+= [[i,j,n+j],[i,n+j,n+i],[2*n,j,i],[2*n+1,n+i,n+j]]
    m.add(V,F,color)
def sector(m,rin,rout,a0,a1,z0,z1,color,n=24):
    th=np.linspace(a0,a1,n);V=[];F=[]
    for t in th:
        for r in(rin,rout):
            for z in(z0,z1): V.append([r*np.cos(t),r*np.sin(t),z])
    for i in range(n-1):
        b=4*i;c=4*(i+1)
        # idx: 0 rin z0,1 rin z1,2 rout z0,3 rout z1
        F+=[[b+2,c+2,c+3],[b+2,c+3,b+3],[b+0,b+1,c+1],[b+0,c+1,c+0],[b+1,b+3,c+3],[b+1,c+3,c+1],[b+0,c+0,c+2],[b+0,c+2,b+2]]
    e=4*(n-1);F+=[[0,2,3],[0,3,1],[e,e+1,e+3],[e,e+3,e+2]]
    m.add(np.array(V),F,color)
def ring(m,rin,rout,z0,z1,color,n=64): sector(m,rin,rout,0,2*np.pi,z0,z1,color,n)
def tube(m,pts,r,color,n=8):
    for a,b in zip(pts[:-1],pts[1:]): cyl(m,a,b,r,color,n)
def polar(r,a,z): return [r*np.cos(a),r*np.sin(a),z]
def write_stl(m,path):
    T,_=m.tris()
    with open(path,'wb') as f:
        f.write(b'PhytoHydra'.ljust(80,b' ')); f.write(struct.pack('<I',len(T)))
        for t in T:
            n=np.cross(t[1]-t[0],t[2]-t[0]);l=np.linalg.norm(n);n=n/l if l>0 else n
            f.write(struct.pack('<12fH',*n,*t[0],*t[1],*t[2],0))
    return len(T)
