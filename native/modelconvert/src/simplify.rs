//! Conservative index-only simplification: no vertex relocation, welding across seams, or primitive merging.
use crate::{Result, MAX_BYTES, MAX_TRIANGLES, MAX_VERTICES};
use serde_json::{json, Value};
use std::{fs, path::Path};

fn reduce(
    positions: &[[f32; 3]],
    indices: &[u32],
    attributes: &Vec<f32>,
    locks: &[bool],
    level: usize,
    error: f32,
) -> Vec<u32> {
    // Normal/UV errors have unit weight; a unit attribute change has the same weight as a mesh extent.
    // LockBorder keeps open edges: material boundaries between primitives, thin planes, two-triangle leaf cards.
    // UV/normal seams stay free; meshoptimizer collapses both sides of a seam together, so it never cracks.
    meshopt::simplify_with_attributes_and_locks_decoder(
        indices,
        positions,
        attributes,
        &[1.; 5],
        20,
        locks,
        ((indices.len() / 3 * level / 100).max(1)) * 3,
        error,
        meshopt::SimplifyOptions::LockBorder,
        None,
    )
}

pub fn run(input: &Path, output: &Path) -> Result<()> {
    if fs::metadata(input).map_err(|e| e.to_string())?.len() > (MAX_BYTES * 4) as u64 {
        return Err("Simplification request is too large".into());
    }
    let request: Value = serde_json::from_slice(&fs::read(input).map_err(|e| e.to_string())?)
        .map_err(|e| e.to_string())?;
    let level = request["level"]
        .as_u64()
        .ok_or("Invalid simplification level")? as usize;
    let error = request["error"]
        .as_f64()
        .ok_or("Invalid simplification error")? as f32;
    if ![25, 50, 75].contains(&level) || !error.is_finite() || error <= 0. || error > 0.01 {
        return Err("Invalid simplification settings".into());
    }
    let parts = request["primitives"]
        .as_array()
        .ok_or("Missing primitives")?;
    if parts.len() > 4096 {
        return Err("Too many primitives".into());
    }
    let mut result = Vec::new();
    let mut vertices = 0;
    let mut triangles = 0;
    for part in parts {
        let p: Vec<[f32; 3]> =
            serde_json::from_value(part["positions"].clone()).map_err(|e| e.to_string())?;
        let i: Vec<u32> =
            serde_json::from_value(part["indices"].clone()).map_err(|e| e.to_string())?;
        let a: Vec<f32> =
            serde_json::from_value(part["attributes"].clone()).map_err(|e| e.to_string())?;
        let l: Vec<bool> =
            serde_json::from_value(part["locks"].clone()).map_err(|e| e.to_string())?;
        vertices += p.len();
        triangles += i.len() / 3;
        if vertices > MAX_VERTICES
            || triangles > MAX_TRIANGLES
            || p.is_empty()
            || i.is_empty()
            || i.len() % 3 != 0
            || a.len() != p.len() * 5
            || l.len() != p.len()
            || i.iter().any(|&n| n as usize >= p.len())
            || p.iter().flatten().chain(a.iter()).any(|v| !v.is_finite())
        {
            return Err("Invalid simplification geometry".into());
        }
        result.push(reduce(&p, &i, &a, &l, level, error));
    }
    fs::write(
        output,
        serde_json::to_vec(&json!(result)).map_err(|e| e.to_string())?,
    )
    .map_err(|e| e.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn planar_grid_reaches_target_without_moving_locked_vertices() {
        let mut positions = Vec::new();
        let mut indices = Vec::new();
        for y in 0..12 {
            for x in 0..12 {
                positions.push([x as f32, y as f32, 0.]);
            }
        }
        for y in 0..11 {
            for x in 0..11 {
                let a = y * 12 + x;
                indices.extend([a, a + 1, a + 12, a + 1, a + 13, a + 12]);
            }
        }
        let attributes = positions
            .iter()
            .flat_map(|p| [0., 0., 1., p[0] / 11., p[1] / 11.])
            .collect();
        let mut locks = vec![false; positions.len()];
        locks[65] = true;
        let result = reduce(&positions, &indices, &attributes, &locks, 25, 0.01);
        assert!(result.len() <= indices.len() / 4);
        assert!(result.contains(&65));
        assert!(result.iter().all(|&i| (i as usize) < positions.len()));
    }

    #[test]
    fn isolated_leaf_card_cannot_reduce() {
        let p = vec![[0., 0., 0.], [1., 0., 0.], [0., 1., 0.], [1., 1., 0.]];
        let i = vec![0, 1, 2, 1, 3, 2];
        assert_eq!(reduce(&p, &i, &vec![0.; 20], &vec![false; 4], 25, 0.01), i);
    }
}
