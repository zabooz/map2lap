"""Tile splits share terrain lighting without changing geometry or UVs."""
from pathlib import Path
import sys
import tempfile
import unittest
from unittest import mock

import numpy as np

sys.path.insert(0,str(Path(__file__).resolve().parents[2]/'src'))
from track import kn5
from app import trackheights


class GroundNormalsTest(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();self.addCleanup(self.temp.cleanup)
        self.path=Path(self.temp.name)/'terrain.kn5'
        self.root=kn5.Node(1,'root',1,matrix=tuple(np.eye(4).ravel()))
        for i,points in enumerate(([(254,2,1),(256,0,1),(256,0,3)],[(256,0,1),(258,0,1),(256,0,3)])):
            v=np.zeros(3,kn5.VERTEX);v['pos']=points
            v['normal']=[-.75803244,.45318797,.46904957] if i==0 else [.04951918,.80957788,.58492005]
            v['tangent']=[1,0,0];v['uv']=np.asarray(points)[:,[0,2]]/256
            self.root.children.append(kn5.Node(2,f'1GRASS_ground_{i}_0',1,vertices=v,indices=np.array([0,2,1],'<u2'),material=0,
                bs_center=(256,0,2),bs_radius=5))
        kn5.write(self.path,[],[kn5.Material('ground','ksPerPixel',0,0,0,[],[])],self.root)

    def test_area_weighted_border_cache_changes_only_normal_and_tangent_and_build_output(self):
        from track import groundnormals
        groundnormals._cached.cache_clear()
        with mock.patch.object(groundnormals,'_build',wraps=groundnormals._build) as build:
            patches=groundnormals.patches(self.path)
            self.assertIs(patches,groundnormals.patches(self.path))
            self.assertEqual(1,build.call_count)
        expected=np.array([1,2,0])/np.sqrt(5)
        for i,node in enumerate(self.root.children):
            fixed=groundnormals.apply(node.vertices,patches[i])
            shared=np.flatnonzero(fixed['pos'][:,0]==256)
            np.testing.assert_allclose(fixed['normal'][shared],np.broadcast_to(expected,(2,3)),atol=1e-7)
            np.testing.assert_allclose(np.sum(fixed['normal'][shared]*fixed['tangent'][shared],axis=1),0,atol=1e-7)
            for field in ('pos','uv'):np.testing.assert_array_equal(node.vertices[field],fixed[field])
            interior=fixed['pos'][:,0]!=256
            self.assertEqual(node.vertices[interior].tobytes(),fixed[interior].tobytes())
        before=self.path.read_bytes()
        lighting=groundnormals.changed(self.path,kn5.Moved({}, {}, {}))
        target=Path(self.temp.name)/'lighting.kn5'
        kn5.without_faces(self.path,target,{},lighting)
        lighting_saved=kn5.read(target)
        for i,node in enumerate(lighting_saved['root'].children):
            np.testing.assert_array_equal(groundnormals.apply(self.root.children[i].vertices,patches[i]),node.vertices)
        self.assertEqual(before,self.path.read_bytes(),'Save must never patch its retained input')
        groundnormals.write(self.path)
        saved=kn5.read(self.path)
        self.assertNotEqual(before,self.path.read_bytes())
        for old,new in zip(self.root.children,saved['root'].children):
            self.assertEqual(old.name,new.name)
            np.testing.assert_array_equal(old.indices,new.indices)
            for field in ('pos','uv'):np.testing.assert_array_equal(old.vertices[field],new.vertices[field])

    def test_height_shear_uses_shared_source_normals_and_save_preserves_the_shear(self):
        from track import groundnormals
        scan=kn5.scan(self.path)
        op={'id':'ramp','x':252,'z':-2,'nx':5,'nz':5,'mm':[0]*25}
        raster=np.asarray(op['mm']).reshape(5,5);raster[1:4,1:4]=np.array([0,1000,2000])[None,:]
        op['mm']=raster.ravel().tolist()
        moved=trackheights.moved(self.path,scan,{},[op])
        first=moved.vertices[0];second=moved.vertices[1]
        a=first[first['pos'][:,0]==256];b=second[second['pos'][:,0]==256]
        np.testing.assert_allclose(a['normal'],b['normal'],atol=1e-7)
        result=groundnormals.changed(self.path,moved)
        self.assertEqual(first.tobytes(),result.vertices[0].tobytes())
        self.assertEqual(second.tobytes(),result.vertices[1].tobytes())
        target=Path(self.temp.name)/'height.kn5'
        kn5.without_faces(self.path,target,{},result)
        saved=kn5.read(target)
        for i,node in enumerate(saved['root'].children):
            np.testing.assert_array_equal(result.vertices[i],node.vertices)


if __name__=='__main__':unittest.main()
