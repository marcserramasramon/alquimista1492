import sys, copy
sys.path.insert(0, sys.argv[0].rsplit('/', 1)[0])
from gltfio import *

SRC, DST = sys.argv[1], sys.argv[2]
j, b = load(SRC)
nm = {n['name']: i for i, n in enumerate(j['nodes'])}
par = parents(j)
sk = j['skins'][0]
prim = j['meshes'][0]['primitives'][0]['attributes']
V = acc(j, b, prim['POSITION']).astype(float)
W0 = world_mats(j)
pos = lambda n: W0[nm[n]][:3, 3].copy()

newpos = {}
Wn = [M.copy() for M in W0]
for n, p in newpos.items(): Wn[nm[n]][:3, 3] = p

def set_local(i, L):
    n = j['nodes'][i]
    S = np.linalg.norm(L[:3, :3], axis=0)
    R = L[:3, :3] / S
    n['translation'] = L[:3, 3].tolist()
    n['rotation'] = mat2q(R).tolist()
    n['scale'] = S.tolist()
    n.pop('matrix', None)

def mat2q(R):
    t = np.trace(R)
    if t > 0:
        s = np.sqrt(t+1)*2; q = [(R[2,1]-R[1,2])/s, (R[0,2]-R[2,0])/s, (R[1,0]-R[0,1])/s, s/4]
    elif R[0,0] > R[1,1] and R[0,0] > R[2,2]:
        s = np.sqrt(1+R[0,0]-R[1,1]-R[2,2])*2; q = [s/4, (R[0,1]+R[1,0])/s, (R[0,2]+R[2,0])/s, (R[2,1]-R[1,2])/s]
    elif R[1,1] > R[2,2]:
        s = np.sqrt(1+R[1,1]-R[0,0]-R[2,2])*2; q = [(R[0,1]+R[1,0])/s, s/4, (R[1,2]+R[2,1])/s, (R[0,2]-R[2,0])/s]
    else:
        s = np.sqrt(1+R[2,2]-R[0,0]-R[1,1])*2; q = [(R[0,2]+R[2,0])/s, (R[1,2]+R[2,1])/s, s/4, (R[1,0]-R[0,1])/s]
    q = np.array(q); return q/np.linalg.norm(q)

for i in range(len(j['nodes'])):
    if i in par: set_local(i, np.linalg.inv(Wn[par[i]]) @ Wn[i])

ibm_acc = j['accessors'][sk['inverseBindMatrices']]
ibv = j['bufferViews'][ibm_acc['bufferView']]
o = ibv.get('byteOffset', 0) + ibm_acc.get('byteOffset', 0)
IBM = np.array([np.linalg.inv(Wn[i]).T.reshape(-1) for i in sk['joints']], dtype=np.float32)
b[o:o+IBM.nbytes] = IBM.tobytes()

