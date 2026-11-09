"""Shared terrain lighting across the artificial 256 m tile splits."""
import functools
from pathlib import Path
import re
import threading

import numpy as np

from track import kn5

GROUND = re.compile(r'1(?:ROAD|GRASS|GRAVEL)_ground_-?\d+_-?\d+(?:_\d+)?\Z')
_lock = threading.RLock()


def _state(path):
    stat=Path(path).stat()
    return stat.st_mtime_ns,stat.st_ctime_ns,stat.st_size


def _build(path):
    """Accumulate area-weighted source faces only at exact shared 3D tile-border vertices."""
    scan=kn5.scan(path);points={}
    with open(path,'rb') as file:
        for i,mesh in enumerate(scan['meshes']):
            if not GROUND.fullmatch(mesh['name']):continue
            vertices,faces=kn5.mesh_arrays(file,mesh)
            pos=vertices['pos']
            # These are artificial tile splits, not cliffs: equal XYZ must share
            # lighting. Exact 3D keys keep wall-cut steps at different heights apart.
            border=(pos[:,0]%256==0)|(pos[:,2]%256==0)
            selected=faces[np.any(border[faces],axis=1)]
            if not len(selected):continue
            fn=np.cross(pos[selected[:,1]].astype(np.float64)-pos[selected[:,0]],
                        pos[selected[:,2]].astype(np.float64)-pos[selected[:,0]])
            accum=np.zeros((len(vertices),3),np.float64)
            for k in range(3):np.add.at(accum,selected[:,k],fn)
            for j in np.flatnonzero(border):
                point=points.setdefault(tuple(pos[j]),[np.zeros(3),[]])
                point[0]+=accum[j];point[1].append((i,j))
    result={}
    for vector,refs in points.values():
        if len({i for i,_j in refs})<2:continue
        length=np.linalg.norm(vector)
        if length<1e-12:continue
        normal=vector/length
        # Ground UV U follows world X. Its tangent lies in the X/Y plane, also
        # when neighbouring physical-surface meshes use different UV scales.
        tangent=np.array([normal[1],-normal[0],0.])
        tangent=tangent/np.linalg.norm(tangent) if np.linalg.norm(tangent)>1e-12 else np.array([1.,0.,0.])
        for i,j in refs:
            entry=result.setdefault(i,[[],[],[]])
            entry[0].append(j);entry[1].append(normal);entry[2].append(tangent)
    return {i:(np.asarray(rows[0],np.intp),np.asarray(rows[1],np.float32),np.asarray(rows[2],np.float32))
            for i,rows in result.items()}


@functools.lru_cache(maxsize=2)
def _cached(path,state):
    result=_build(path)
    if _state(path)!=state:raise OSError('The terrain source changed while its lighting was prepared')
    for rows in result.values():
        for array in rows:array.flags.writeable=False
    return result


def patches(path):
    """Small immutable patches for at most two source revisions; concurrent requests share one scan."""
    path=str(Path(path).resolve())
    with _lock:return _cached(path,_state(path))


def apply(vertices,patch):
    """Copy only when a border patch exists; position, UV and topology remain unchanged. Pure."""
    if patch is None:return vertices
    indices,normal,tangent=patch
    result=vertices.copy();result['normal'][indices]=normal;result['tangent'][indices]=tangent
    return result


def changed(path,change):
    """Include shared source lighting in Save; height-edited meshes already carry the transformed patches."""
    table=patches(path)
    if not table:return change
    scan=kn5.scan(path);vertices=dict(change.vertices)
    with open(path,'rb') as file:
        for i,patch in table.items():
            if i not in vertices:vertices[i]=apply(kn5.mesh_arrays(file,scan['meshes'][i])[0],patch)
    return kn5.Moved(vertices,change.grow,change.points)


def write(path):
    """Patch only newly generated KN5 lighting; the Editor never writes its retained source."""
    table=patches(path)
    if not table:return
    scan=kn5.scan(path)
    with open(path,'r+b') as file:
        for i,(indices,normals,tangents) in table.items():
            offset=scan['meshes'][i]['offset']
            for j,normal,tangent in zip(indices,normals,tangents):
                file.seek(offset+int(j)*kn5.VERTEX.itemsize+12);file.write(normal.tobytes())
                file.seek(offset+int(j)*kn5.VERTEX.itemsize+32);file.write(tangent.tobytes())
