//! Road paint clipped to its own deck triangles: a banked quadrilateral is not a plane.
use numpy::{IntoPyArray, PyArray1, PyArray2, PyReadonlyArray1, PyReadonlyArray2};
use pyo3::prelude::*;
use std::collections::{HashMap, BTreeSet};

/// Overlay source triangles on a known, same-owner deck surface. UVs stay interpolated in
/// the source; heights use the target plane plus the source triangle's paint lift.
#[pyfunction]
pub fn deck_skin<'py>(py: Python<'py>, p: PyReadonlyArray2<'py, f64>, uv: PyReadonlyArray2<'py, f64>,
    t: PyReadonlyArray2<'py, i64>, surface: PyReadonlyArray2<'py, f64>, faces: PyReadonlyArray2<'py, i64>,
    lifts: PyReadonlyArray1<'py, f64>) -> (Bound<'py, PyArray2<f64>>, Bound<'py, PyArray2<i64>>,
                                          Bound<'py, PyArray2<f64>>, Bound<'py, PyArray1<i64>>) {
    let (p, uv, t, surface, faces, lifts) = (p.as_array(), uv.as_array(), t.as_array(),
        surface.as_array(), faces.as_array(), lifts.as_array());
    let (po, to, uo, src) = py.allow_threads(|| {
        let mut grid: HashMap<(i64, i64), Vec<usize>> = HashMap::new();
        let mut targets = Vec::new();
        // Spatial buckets only accelerate lookup; their size does not change geometry.
        let bucket = 16.0;
        let bounds = |v: &[[f64; 3]]| -> [i64; 4] {
            let mut b = [f64::INFINITY, f64::INFINITY, f64::NEG_INFINITY, f64::NEG_INFINITY];
            for q in v { b = [b[0].min(q[0]), b[1].min(q[1]), b[2].max(q[0]), b[3].max(q[1])]; }
            b.map(|v| (v / bucket).floor() as i64)
        };
        for i in 0..faces.nrows() {
            let v: Vec<[f64; 3]> = (0..3).map(|k| {let j=faces[[i,k]] as usize;
                [surface[[j,0]],surface[[j,1]],surface[[j,2]]]}).collect();
            let b = bounds(&v);
            for x in b[0]..=b[2] { for y in b[1]..=b[3] { grid.entry((x,y)).or_default().push(i); } }
            targets.push(v);
        }
        let (mut po, mut to, mut uo, mut src) = (Vec::new(), Vec::new(), Vec::new(), Vec::new());
        for i in 0..t.nrows() {
            let v: Vec<[f64; 3]> = (0..3).map(|k| {let j=t[[i,k]] as usize; [p[[j,0]],p[[j,1]],p[[j,2]]]}).collect();
            let tex: Vec<[f64; 2]> = (0..3).map(|k| {let j=t[[i,k]] as usize; [uv[[j,0]],uv[[j,1]]]}).collect();
            let b = bounds(&v);
            let mut candidates = BTreeSet::new();
            for x in b[0]..=b[2] { for y in b[1]..=b[3] {
                if let Some(ids)=grid.get(&(x,y)) { candidates.extend(ids.iter().copied()); }
            } }
            let before = to.len();
            for j in candidates {
                let s = &targets[j];
                let (a, b, c) = (s[0], s[1], s[2]);
                let det = (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
                if det.abs()<1e-10 {continue;}
                let poly: Vec<[f64; 2]> = s.iter().map(|q| [q[0],q[1]]).collect();
                let cut = crate::geocontent::clip_convex(&v, &tex, &[[0,1,2]], &poly);
                for face in cut.t {
                    let pts = face.map(|k| cut.p[k as usize]);
                    let area=(pts[1][0]-pts[0][0])*(pts[2][1]-pts[0][1])-(pts[1][1]-pts[0][1])*(pts[2][0]-pts[0][0]);
                    if area.abs()<1e-10 {continue;}
                    let base=po.len() as i64;
                    for k in face {
                        let q=cut.p[k as usize];
                        let u=((q[0]-a[0])*(c[1]-a[1])-(q[1]-a[1])*(c[0]-a[0]))/det;
                        let v=((b[0]-a[0])*(q[1]-a[1])-(b[1]-a[1])*(q[0]-a[0]))/det;
                        po.push([q[0],q[1],a[2]+u*(b[2]-a[2])+v*(c[2]-a[2])+lifts[i]]);
                        uo.push(cut.uv[k as usize]);
                    }
                    to.push([base,base+1,base+2]); src.push(i as i64);
                }
            }
            // A fixed ribbon with no deck under it (e.g. a separately drawn tunnel apron)
            // retains its supplied geometry. Never project it onto a different owner.
            if to.len()==before {
                let base=po.len() as i64;
                po.extend(v);uo.extend(tex);to.push([base,base+1,base+2]);src.push(i as i64);
            }
        }
        (po,to,uo,src)
    });
    (numpy::ndarray::Array2::from_shape_vec((po.len(),3),po.into_iter().flatten().collect()).unwrap().into_pyarray(py),
     numpy::ndarray::Array2::from_shape_vec((to.len(),3),to.into_iter().flatten().collect()).unwrap().into_pyarray(py),
     numpy::ndarray::Array2::from_shape_vec((uo.len(),2),uo.into_iter().flatten().collect()).unwrap().into_pyarray(py),
     numpy::ndarray::Array1::from_vec(src).into_pyarray(py))
}
