"""Regional mask requests reuse immutable metadata and rebuild evicted weights once per source version."""
from concurrent.futures import ThreadPoolExecutor
import hashlib
from pathlib import Path
import tempfile
import threading
import time
import sys
from unittest import mock
import unittest
sys.path.insert(0,str(Path(__file__).resolve().parents[2]/'src'))
from app import trackdetail,trackpaint


class RegionCacheTest(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory(); self.addCleanup(self.tmp.cleanup)
        self.root=Path(self.tmp.name); self.version='1'*64
        self.raw=[b'first cached atlas',b'second cached atlas']
        self.keys=[hashlib.sha256(raw).hexdigest() for raw in self.raw]
        self.layout={'ground':{'passes':[{'weight':{'key':key}} for key in self.keys]}}
        saved={'profile':trackdetail.PROFILE,'layout':self.layout}
        self.meta=self.root/'paint-views'/self.version/'layers.json'
        trackpaint._atomic(self.meta,trackpaint._json_bytes({**saved,'digest':trackpaint._digest(saved)}))
        patches=[mock.patch.object(trackpaint,'_out',side_effect=lambda kind,*parts:self.root/kind/Path(*parts)),
            mock.patch.object(trackdetail,'_cache',side_effect=lambda key,kind:self.root/(key+'-'+kind)),
            mock.patch.object(trackdetail,'_view',return_value=({},'source',{},'ground_0_0.png'))]
        for patch in patches: patch.start(); self.addCleanup(patch.stop)

    def test_cached_mask_get_does_not_rebuild_the_large_descriptor_or_revalidate_unrelated_photos(self):
        target=trackdetail._cache(self.keys[0],'region').with_suffix('.r16'); target.write_bytes(self.raw[0])
        with mock.patch.object(trackdetail,'describe',return_value=self.layout) as describe:
            self.assertEqual(self.raw[0],trackdetail.region_image('ac','track',self.version,self.keys[0]))
        self.assertEqual(0,describe.call_count,'Hundreds of mask GETs must not each rebuild the full descriptor')

    def test_parallel_evicted_mask_gets_recompile_once_and_changed_membership_is_not_reused(self):
        from app import trackregions
        barrier=threading.Barrier(2)
        def rebuild(_layout,_weights,_version,store):
            time.sleep(.04)
            for key,raw in zip(self.keys,self.raw): store(key,raw)
        def request(key):
            barrier.wait(); return trackdetail.region_image('ac','track',self.version,key)
        with (mock.patch.object(trackdetail,'describe',return_value=self.layout),
              mock.patch.object(trackdetail,'_semantic',return_value=({'dimensions':[32,32]}, {}, None)),
              mock.patch.object(trackregions,'compile',side_effect=rebuild) as compile):
            with ThreadPoolExecutor(2) as workers:
                results=list(workers.map(request,self.keys))
        self.assertEqual(self.raw,results)
        self.assertEqual(1,compile.call_count,'Parallel cache misses share one full-source compile')
        saved={'profile':trackdetail.PROFILE,'layout':{'ground':{'passes':[]}}}
        trackpaint._atomic(self.meta,trackpaint._json_bytes({**saved,'digest':trackpaint._digest(saved)}))
        with self.assertRaisesRegex(ValueError,'belong'):
            trackdetail.region_image('ac','track',self.version,self.keys[0])


if __name__=='__main__': unittest.main()
