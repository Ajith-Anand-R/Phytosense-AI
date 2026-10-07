import numpy as np, matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from PIL import Image
def _cam(az,el):
    a,e=np.radians(az),np.radians(el)
    f=np.array([np.cos(e)*np.cos(a),np.cos(e)*np.sin(a),np.sin(e)])   # towards camera
    right=np.array([-np.sin(a),np.cos(a),0.]); up=np.cross(f,right)
    return f,right,up
def raster(m,az=-60,el=15,W=1400,H=1400,lim=None,ss=2,bg=(255,255,255)):
    T,C=m.tris();C=np.array(C)
    f,rt,up=_cam(az,el)
    n=np.cross(T[:,1]-T[:,0],T[:,2]-T[:,0]);ln=np.linalg.norm(n,axis=1,keepdims=True);ln[ln==0]=1;n/=ln
    L=f*0.6+np.array([0.35,-0.25,0.75]);L/=np.linalg.norm(L)
    sh=0.32+0.68*np.abs(n@L)
    spec=np.clip(np.abs(n@((L+f)/np.linalg.norm(L+f))),0,1)**30*0.25
    FC=np.clip(C*sh[:,None]+spec[:,None],0,1)
    P=T.reshape(-1,3); X=P@rt; Y=P@up; Z=P@f
    if lim is None: x0,x1,y0,y1=X.min(),X.max(),Y.min(),Y.max()
    else:
        cs=np.array([[a,b,c] for a in(lim[0][0],lim[1][0]) for b in(lim[0][1],lim[1][1]) for c in(lim[0][2],lim[1][2])])
        cx,cy=cs@rt,cs@up; x0,x1,y0,y1=cx.min(),cx.max(),cy.min(),cy.max()
    Ws,Hs=W*ss,H*ss; sc=min((Ws-20)/(x1-x0),(Hs-20)/(y1-y0))
    ox=(Ws-(x1-x0)*sc)/2; oy=(Hs-(y1-y0)*sc)/2
    sx=(X-x0)*sc+ox; sy=Hs-((Y-y0)*sc+oy)
    sx=sx.reshape(-1,3);sy=sy.reshape(-1,3);sz=Z.reshape(-1,3)
    img=np.ones((Hs,Ws,3))*np.array(bg)/255.; zb=np.full((Hs,Ws),-1e18)
    for i in range(len(sx)):
        xs,ys,zs=sx[i],sy[i],sz[i]
        xa,xb=int(max(0,np.floor(xs.min()))),int(min(Ws-1,np.ceil(xs.max())));ya,yb=int(max(0,np.floor(ys.min()))),int(min(Hs-1,np.ceil(ys.max())))
        if xa>xb or ya>yb: continue
        d=(ys[1]-ys[2])*(xs[0]-xs[2])+(xs[2]-xs[1])*(ys[0]-ys[2])
        if abs(d)<1e-9: continue
        gx,gy=np.meshgrid(np.arange(xa,xb+1)+0.5,np.arange(ya,yb+1)+0.5)
        w0=((ys[1]-ys[2])*(gx-xs[2])+(xs[2]-xs[1])*(gy-ys[2]))/d
        w1=((ys[2]-ys[0])*(gx-xs[2])+(xs[0]-xs[2])*(gy-ys[2]))/d
        w2=1-w0-w1
        msk=(w0>=-1e-6)&(w1>=-1e-6)&(w2>=-1e-6)
        if not msk.any(): continue
        z=w0*zs[0]+w1*zs[1]+w2*zs[2]
        sub=zb[ya:yb+1,xa:xb+1]; upd=msk&(z>sub)
        sub[upd]=z[upd]; img[ya:yb+1,xa:xb+1][upd]=FC[i]
    # edge darkening via depth discontinuity
    dz=np.zeros_like(zb); valid=zb>-1e17
    zz=np.where(valid,zb,zb[valid].min()-500 if valid.any() else 0)
    dz[1:,:]=np.maximum(dz[1:,:],np.abs(np.diff(zz,axis=0)));dz[:,1:]=np.maximum(dz[:,1:],np.abs(np.diff(zz,axis=1)))
    edge=dz>(8.0)
    img[edge]=img[edge]*0.35
    im=Image.fromarray((img*255).astype(np.uint8)).resize((W,H),Image.LANCZOS)
    def proj(p):
        p=np.array(p);return (((p@rt)-x0)*sc+ox)/ss, (Hs-(((p@up)-y0)*sc+oy))/ss
    return im,proj
def figure(m,path,title,labels=(),az=-60,el=15,W=1400,H=1400,lim=None,img_frac=0.62,side='right',note=None):
    im,proj=raster(m,az,el,W,H,lim)
    dpi=150; FW=W/img_frac
    fig=plt.figure(figsize=(FW/dpi,(H+140)/dpi),dpi=dpi,facecolor='white')
    ax=fig.add_axes([0 if side=='right' else 1-img_frac,0,img_frac,H/(H+140)]);ax.imshow(im);ax.set_axis_off()
    fig.text(0.02,0.985,title,fontsize=14,fontweight='bold',color='#1b3a24',va='top')
    if note: fig.text(0.02,0.945,note,fontsize=9.5,color='#555',va='top')
    pts=[]
    for p,txt in labels:
        px,py=proj(p); fx=(0 if side=='right' else 1-img_frac)+px/W*img_frac; fy=(1-py/H)*H/(H+140); pts.append((fy,fx,txt))
    pts.sort(reverse=True)
    if pts:
        top,bot=0.86,0.06
        ys=np.linspace(top,bot,len(pts)) if len(pts)>1 else [pts[0][0]]
        # keep labels near their points when spacing allows
        ys=[min(top,max(bot,y)) for y in ys]
        for (fy,fx,txt),ty in zip(pts,ys):
            tx=img_frac+0.03 if side=='right' else 1-img_frac-0.03
            fig.text(tx+(0.008 if side=='right' else -0.008),ty,txt,fontsize=10,va='center',ha='left' if side=='right' else 'right',color='#1f1f1f')
            fig.add_artist(plt.Line2D([fx,tx],[fy,ty],transform=fig.transFigure,color='#6b6b6b',lw=0.8))
            fig.add_artist(plt.Circle((fx,fy),0.0035,transform=fig.transFigure,color='#c0392b',zorder=5))
    fig.savefig(path,dpi=dpi,facecolor='white');plt.close(fig)
