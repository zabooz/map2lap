//! Shared window axes for facade emission and inferred entrances. Distances are metres.
use pyo3::prelude::*;

#[derive(Clone, Copy)]
pub(crate) struct Layout {
    pub count: i64,
    pub width: f64,
}

impl Layout {
    pub fn new(width: f64, bay: f64, separate_windows: bool) -> Self {
        let count = if separate_windows {
            // Match the existing detached-house spacing; no extra bay squeezed into a wall.
            crate::py_floordiv(width, bay) as i64
        } else {
            (width / bay).round_ties_even() as i64
        };
        Self { count: count.max(0), width }
    }

    pub fn axis(self, index: i64) -> f64 {
        self.width * (index as f64 + 0.5) / self.count as f64
    }

    pub fn entrance(self, preferred: f64, clearance: f64) -> Option<f64> {
        if self.width < 2.0 * clearance {
            return None;
        }
        if self.count == 0 {
            return Some(preferred.clamp(clearance, self.width - clearance));
        }
        let bay = self.width / self.count as f64;
        let first = ((clearance / bay - 0.5).ceil() as i64).max(0);
        let last = (((self.width - clearance) / bay - 0.5).floor() as i64).min(self.count - 1);
        if first > last {
            return None;
        }
        let nearest = ((preferred / bay - 0.5).round_ties_even() as i64).clamp(first, last);
        Some(self.axis(nearest))
    }

    pub fn entrance_bays(self, door: f64, clearance: f64) -> (f64, f64) {
        let (mut start, mut end) = (door - clearance, door + clearance);
        if self.count > 0 {
            let bay = self.width / self.count as f64;
            start = (start / bay).floor() * bay;
            end = (end / bay).ceil() * bay;
        }
        (start.max(0.0), end.min(self.width))
    }
}

pub(crate) fn overlaps(start: f64, end: f64, door: f64, clearance: f64) -> bool {
    start < door + clearance && end > door - clearance
}

/// Plan a wall's axes and optional inferred entrance without emitting or allocating a mesh. Pure.
#[pyfunction]
#[pyo3(signature = (width, bay, separate_windows, preferred=None, clearance=0.75))]
pub fn facade_layout(width: f64, bay: f64, separate_windows: bool,
                     preferred: Option<f64>, clearance: f64) -> PyResult<(i64, Option<f64>)> {
    if !width.is_finite() || width <= 0.0 || !bay.is_finite() || bay <= 0.0
        || !clearance.is_finite() || clearance <= 0.0
        || preferred.is_some_and(|p| !p.is_finite() || p < 0.0 || p > width)
        || width / bay > i32::MAX as f64
    {
        return Err(pyo3::exceptions::PyValueError::new_err("invalid facade dimensions"));
    }
    let layout = Layout::new(width, bay, separate_windows);
    Ok((layout.count, preferred.and_then(|p| layout.entrance(p, clearance))))
}
