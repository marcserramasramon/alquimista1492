import sys, os
HERE = os.path.dirname(os.path.abspath(sys.argv[0]))
exec(open(os.path.join(HERE, 'rigsense.py')).read())

FPS = 30
X, Y, Z = [1, 0, 0], [0, 1, 0], [0, 0, 1]
deg = np.radians
I = np.array([0, 0, 0, 1.0])
def fwd(a): return qaxis(X, -a)
def smooth(x): x = np.clip(x, 0, 1); return x*x*(3-2*x)
def ramp(t, a, b): return smooth((t-a)/(b-a))

# ---------------- building blocks ----------------
def walk_angles(ph, w):
    """per-joint world-rest rotations for a walk at phase ph, scaled by weight w"""
    out = {}
    for s, sh in (('l', 0.0), ('r', np.pi)):
        p = ph + sh
        th = deg(24)*np.sin(p)
        kn = deg(6) + deg(48)*max(0, np.cos(p))**1.6
        ank = th - kn + deg(-14)*max(0, -np.cos(p+0.5))**3
        toe = deg(20)*max(0, -np.cos(p+0.7))**4
        out[f'thigh_{s}'] = th*w; out[f'calf_{s}'] = -kn*w
        out[f'foot_{s}'] = ank*w; out[f'ball_{s}'] = toe*w
        out[f'upperarm_{s}'] = -deg(16)*np.sin(p)*w
        out[f'lowerarm_{s}'] = (deg(10) + deg(10)*max(0, np.sin(-p)))*w
    yaw = deg(6)*np.sin(ph)*w; roll = deg(3)*np.cos(2*ph)*w
    bob = (-0.28*abs(np.sin(ph)) + 0.2)*w
    return out, yaw, roll, bob

# ---------------- timeline (modes: walk | senyal) ----------------
MODE = sys.argv[3]
def ramp_t(t, a, b): return ramp(t, a, b)
if MODE == 'senyal':
    TOTAL = 3.0
    NOM = 'Senyal'
    def w_walk(t): return 0.0*t
    def arm_up(t): return ramp(t, 0.2, 0.8) - ramp(t, 2.4, 3.0)
else:
    TOTAL = 1.0
    NOM = 'Walk'
    def w_walk(t): return 1.0 + 0.0*t
    def arm_up(t): return 0.0*t

def phase_of(t, n=2000):
    ts = np.linspace(0, t, n); return 2*np.pi*np.trapezoid([w_walk(x) for x in ts], ts) if t > 0 else 0.0

def pose(t, speed):
    ww = w_walk(t); ph = phase_of(t)
    wa, yaw, roll, bob = walk_angles(ph, ww)
    rot = {n: fwd(a) for n, a in wa.items()}
    # cos cap a +Z (sense gir del tronc)
    rot['pelvis'] = qmul(qaxis(Y, yaw), qaxis(Z, roll))
    rot['spine_02'] = qaxis(Y, -0.6*yaw)
    rot['spine_03'] = qmul(qaxis(Y, -0.6*yaw), qaxis(X, deg(4)*ww))
    rot['head'] = qaxis(Y, 0.3*yaw)
    u = arm_up(t)
    if MODE == 'senyal' and u > 0:
        ua = rot.get('upperarm_r', I); la = rot.get('lowerarm_r', I)
        rot['upperarm_r'] = qmul(qmul(fwd(deg(30)*u), qaxis(Z, deg(-4)*u)), ua)
        rot['lowerarm_r'] = qmul(qmul(fwd(deg(52)*u), qaxis(Y, deg(-90)*u)), la)
        cyc = np.clip((t-0.8)/1.6, 0, 1)
        curl = 0.5 - 0.5*np.cos(cyc*3*2*np.pi) if 0 < cyc < 1 else 0
        rot['hand_r'] = qaxis(Z, (deg(10) + deg(55)*curl)*u)
        rot['index_01_r'] = qaxis(Z, deg(25)*curl*u)
        rot['clavicle_r'] = fwd(deg(10)*u)
    idle = 1 - ww
    rot['spine_03'] = qmul(qaxis(X, deg(1.5)*np.sin(t*2.4)*idle), rot['spine_03'])
    off = np.array([0.0, bob, 0.0])
    return rot, off

# ---------------- measure stride speed (stance foot speed in place) ----------------
pivot = {n: Wn[nm[n]][:3, 3] for n in nm}
def local_from(n, q, off=None):
    i = nm[n]; P = pivot[n]
    D = np.eye(4); D[:3, :3] = qmat(q); D[:3, 3] = P - qmat(q) @ P
    if off is not None: D[:3, 3] += off
    return np.linalg.inv(Wn[par[i]]) @ D @ Wn[i]

def ankle_z(ph):
    wa, *_ = walk_angles(ph, 1)
    ov = {}
    for n, a in wa.items():
        L = local_from(n, fwd(a)); S = np.linalg.norm(L[:3, :3], axis=0)
        ov[nm[n]] = {'translation': L[:3, 3].tolist(), 'rotation': mat2q(L[:3, :3]/S).tolist(), 'scale': S.tolist()}
    Wm = world_mats(j, ov)
    return Wm[nm['foot_l']][:3, 3]
phs = np.linspace(0, 2*np.pi, 121)
A = np.array([ankle_z(p) for p in phs])
low = A[:, 1] < np.percentile(A[:, 1], 40)                      # stance frames
vz = np.gradient(A[:, 2], phs/(2*np.pi))                         # units per cycle
speed = float(-np.median(vz[low]))
print('stride speed per cycle', round(speed, 2))

# ---------------- bake ----------------
T = np.arange(int(TOTAL*FPS)+1)/FPS
names = set()
for t in T[::10]: names |= set(pose(t, speed)[0])
names = sorted(names)
chans = {n: ([], []) for n in names}
for t in T:
    rot, off = pose(t, speed)
    for n in names:
        q = rot.get(n, I)
        L = local_from(n, q, off if n == 'pelvis' else None)
        S = np.linalg.norm(L[:3, :3], axis=0); qq = mat2q(L[:3, :3]/S)
        if chans[n][1] and np.dot(chans[n][1][-1], qq) < 0: qq = -qq
        chans[n][0].append(L[:3, 3]); chans[n][1].append(qq)

j['animations'] = []
tacc = add_acc(j, b, T.reshape(-1, 1), 'SCALAR')
samplers, channels = [], []
for n, (tr, rq) in chans.items():
    for path, data, typ in (('translation', tr, 'VEC3'), ('rotation', rq, 'VEC4')):
        a = add_acc(j, b, np.array(data), typ)
        samplers.append({'input': tacc, 'output': a, 'interpolation': 'LINEAR'})
        channels.append({'sampler': len(samplers)-1, 'target': {'node': nm[n], 'path': path}})
j['animations'].append({'name': NOM, 'samplers': samplers, 'channels': channels})

# tidy zero-weight joint indices
JJ = acc(j, b, prim['JOINTS_0']).copy(); WW = acc(j, b, prim['WEIGHTS_0']); JJ[WW == 0] = 0
ja = j['accessors'][prim['JOINTS_0']]; jv = j['bufferViews'][ja['bufferView']]
o = jv.get('byteOffset', 0) + ja.get('byteOffset', 0); b[o:o+JJ.nbytes] = JJ.astype(np.uint8).tobytes()
save(DST, j, b)
print('ok', len(channels), 'channels', len(T), 'keys', TOTAL, 's')
