//! Bounded quadratic road splines, before terrain, asphalt and markings use the line.
use numpy::{IntoPyArray, PyArray2, PyReadonlyArray1, PyReadonlyArray2};
use pyo3::prelude::*;

/// Round unpinned bends of xy in metres. Endpoints and sharp mapped turns stay fixed. Pure.
#[pyfunction]
pub fn road_curve<'py>(
    py: Python<'py>, xy: PyReadonlyArray2<'py, f64>, pinned: PyReadonlyArray1<'py, u8>,
    deviation: f64,
) -> PyResult<Bound<'py, PyArray2<f64>>> {
    let (xy, pinned) = (xy.as_array(), pinned.as_array());
    if xy.ncols() != 2 || pinned.len() != xy.nrows() || !deviation.is_finite() || deviation <= 0.0
        || xy.iter().any(|v| !v.is_finite()) {
        return Err(pyo3::exceptions::PyValueError::new_err("road_curve needs finite xy, one pin per point and positive deviation"));
    }
    let n = xy.nrows();
    let point = |i: usize| [xy[[i, 0]], xy[[i, 1]]];
    let mut out: Vec<[f64; 2]> = Vec::new();
    for i in 0..n {
        let p = point(i);
        if i == 0 || i + 1 == n || pinned[i] != 0 {
            out.push(p);
            continue;
        }
        let (a, b) = (point(i - 1), point(i + 1));
        let (la, lb) = ((p[0] - a[0]).hypot(p[1] - a[1]), (b[0] - p[0]).hypot(b[1] - p[1]));
        if la < 1e-8 || lb < 1e-8 {
            out.push(p);
            continue;
        }
        let u = [(p[0] - a[0]) / la, (p[1] - a[1]) / la];
        let v = [(b[0] - p[0]) / lb, (b[1] - p[1]) / lb];
        let cos = (u[0] * v[0] + u[1] * v[1]).clamp(-1.0, 1.0);
        // Over 90 degrees at a single mapped node can be an actual junction or a reversal;
        // without more map points it does not describe a safe bend to reconstruct.
        if cos <= 1e-8 || cos > 1.0 - 1e-12 {
            out.push(p);
            continue;
        }
        let sin_half = ((1.0 - cos) / 2.0).sqrt();
        // Half an adjoining segment per corner leaves neighbouring splines disjoint.
        // The midpoint moves r*sin(turn/2)/2 from the mapped vertex; the whole curve
        // lies inside the triangle of its controls, so it cannot overshoot the map bbox.
        let r = (0.45 * la.min(lb)).min(2.0 * deviation / sin_half);
        let start = [p[0] - r * u[0], p[1] - r * u[1]];
        let end = [p[0] + r * v[0], p[1] + r * v[1]];
        // Quadratic chord error <= r*sin(turn/2)/(2*n*n): keep it below 5 mm
        // and sample at least every 2 degrees. Almost straight roads need few points.
        let steps = ((r * sin_half / 0.01).sqrt().ceil() as usize)
            .max((cos.acos() / 2.0_f64.to_radians()).ceil() as usize).max(2);
        for k in 0..=steps {
            let t = k as f64 / steps as f64;
            let s = 1.0 - t;
            out.push([s*s*start[0] + 2.0*s*t*p[0] + t*t*end[0],
                      s*s*start[1] + 2.0*s*t*p[1] + t*t*end[1]]);
        }
    }
    out.dedup_by(|a, b| a == b);
    let flat: Vec<f64> = out.iter().flat_map(|p| p.iter().copied()).collect();
    Ok(numpy::ndarray::Array2::from_shape_vec((out.len(), 2), flat).expect("road curve").into_pyarray(py))
}
