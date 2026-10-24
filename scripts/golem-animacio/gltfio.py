import struct, json, numpy as np

def load(path):
    d = open(path, 'rb').read()
    l = struct.unpack('<I', d[12:16])[0]
    j = json.loads(d[20:20+l])
    off = 20 + l
    bl = struct.unpack('<I', d[off:off+4])[0]
    b = bytearray(d[off+8:off+8+bl])
    return j, b

def save(path, j, b):
    while len(b) % 4: b.append(0)
    j['buffers'][0]['byteLength'] = len(b)
    js = json.dumps(j, separators=(',', ':')).encode()
    while len(js) % 4: js += b' '
    total = 12 + 8 + len(js) + 8 + len(b)
    out = struct.pack('<III', 0x46546C67, 2, total)
    out += struct.pack('<II', len(js), 0x4E4F534A) + js
    out += struct.pack('<II', len(b), 0x004E4942) + bytes(b)
    open(path, 'wb').write(out)

def acc(j, b, i):
    a = j['accessors'][i]; v = j['bufferViews'][a['bufferView']]
    ct = {5126: np.float32, 5121: np.uint8, 5123: np.uint16, 5125: np.uint32}[a['componentType']]
    n = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4, 'MAT4': 16}[a['type']]
    o = v.get('byteOffset', 0) + a.get('byteOffset', 0)
    arr = np.frombuffer(bytes(b), ct, count=a['count']*n, offset=o).reshape(-1, n)
    if a.get('normalized'): arr = arr / np.iinfo(ct).max
    return arr

def add_acc(j, b, arr, typ):
    arr = np.ascontiguousarray(arr, dtype=np.float32)
    while len(b) % 4: b.append(0)
    off = len(b); b.extend(arr.tobytes())
    j['bufferViews'].append({'buffer': 0, 'byteOffset': off, 'byteLength': arr.nbytes})
    a = {'bufferView': len(j['bufferViews'])-1, 'componentType': 5126,
         'count': arr.shape[0], 'type': typ}
    if typ == 'SCALAR':
        a['min'] = [float(arr.min())]; a['max'] = [float(arr.max())]
    j['accessors'].append(a)
    return len(j['accessors'])-1

# quaternion helpers (x,y,z,w)
def qmul(a, b):
    ax, ay, az, aw = a; bx, by, bz, bw = b
    return np.array([aw*bx+ax*bw+ay*bz-az*by, aw*by-ax*bz+ay*bw+az*bx,
                     aw*bz+ax*by-ay*bx+az*bw, aw*bw-ax*bx-ay*by-az*bz])
def qconj(q): return np.array([-q[0], -q[1], -q[2], q[3]])
def qaxis(axis, ang):
    axis = np.asarray(axis, float); axis = axis/np.linalg.norm(axis)
    s = np.sin(ang/2); return np.array([*(axis*s), np.cos(ang/2)])
def qarc(u, v):
    u = u/np.linalg.norm(u); v = v/np.linalg.norm(v)
    c = np.cross(u, v); w = 1 + np.dot(u, v)
    q = np.array([*c, w]); return q/np.linalg.norm(q)
def qmat(q):
    x, y, z, w = q
    return np.array([[1-2*(y*y+z*z), 2*(x*y-z*w), 2*(x*z+y*w)],
                     [2*(x*y+z*w), 1-2*(x*x+z*z), 2*(y*z-x*w)],
                     [2*(x*z-y*w), 2*(y*z+x*w), 1-2*(x*x+y*y)]])

def local_mat(n):
    M = np.eye(4)
    if 'matrix' in n: return np.array(n['matrix']).reshape(4, 4).T
    t = n.get('translation', [0, 0, 0]); r = n.get('rotation', [0, 0, 0, 1]); s = n.get('scale', [1, 1, 1])
    M[:3, :3] = qmat(r) @ np.diag(s); M[:3, 3] = t
    return M

def parents(j):
    p = {}
    for i, n in enumerate(j['nodes']):
        for c in n.get('children', []): p[c] = i
    return p

def world_mats(j, overrides=None):
    overrides = overrides or {}
    p = parents(j); N = len(j['nodes']); W = [None]*N
    def get(i):
        if W[i] is not None: return W[i]
        n = dict(j['nodes'][i]); n.update(overrides.get(i, {}))
        L = local_mat(n)
        W[i] = (get(p[i]) @ L) if i in p else L
        return W[i]
    for i in range(N): get(i)
    return W
