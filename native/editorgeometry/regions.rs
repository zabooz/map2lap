use std::{slice, collections::HashMap};

#[no_mangle]
pub extern "C" fn version() -> u32 { 1 }

fn root(parents: &mut [u32], mut i: usize) -> u32 {
    while parents[i] as usize != i {
        parents[i] = parents[parents[i] as usize];
        i = parents[i] as usize;
    }
    i as u32
}

fn coordinate(value: f32) -> u32 {
    // JavaScript string keys merge signed zero and all NaNs; retain those identities.
    if value == 0.0 { 0 } else if value.is_nan() { f32::NAN.to_bits() } else { value.to_bits() }
}

#[no_mangle]
pub extern "C" fn allocate(words: usize) -> *mut u32 {
    Box::into_raw(vec![0u32; words].into_boxed_slice()) as *mut u32
}

#[no_mangle]
pub unsafe extern "C" fn release(pointer: *mut u32, words: usize) {
    drop(Box::from_raw(std::ptr::slice_from_raw_parts_mut(pointer, words)));
}

#[no_mangle]
pub unsafe extern "C" fn components(input: *const u8, vertices: usize, indices: usize, output: *mut u32) {
    let position = slice::from_raw_parts(input as *const f32, vertices * 11);
    let faces = slice::from_raw_parts(input.add(vertices * 44 + 4) as *const u16, indices);
    let owner_offset = (vertices * 44 + 4 + indices * 2 + 3) / 4 * 4;
    let owners = slice::from_raw_parts(input.add(owner_offset) as *const u32, indices / 3);
    let mut numbers = Vec::with_capacity(vertices);
    let mut unique = HashMap::with_capacity(vertices);
    for p in position.chunks_exact(11) {
        let key = [coordinate(p[0]), coordinate(p[1]), coordinate(p[2])];
        let next = unique.len() as u32;
        numbers.push(*unique.entry(key).or_insert(next));
    }
    let mut parents: Vec<u32> = (0..(indices / 3) as u32).collect();
    let mut edges = HashMap::with_capacity(indices);
    for (face, triangle) in faces.chunks_exact(3).enumerate() {
        let corner = [numbers[triangle[0] as usize], numbers[triangle[1] as usize], numbers[triangle[2] as usize]];
        for k in 0..3 {
            let a = corner[k]; let b = corner[(k + 1) % 3];
            if a == b { continue; }
            let key = (owners[face], a.min(b), a.max(b));
            if let Some(&previous) = edges.get(&key) {
                // Same union order as MaterialRegions: saved face numbers and component roots remain stable.
                let current_root = root(&mut parents, face);
                let previous_root = root(&mut parents, previous);
                parents[current_root as usize] = previous_root;
            } else { edges.insert(key, face); }
        }
    }
    for (i, value) in slice::from_raw_parts_mut(output, indices / 3).iter_mut().enumerate() { *value = root(&mut parents, i); }
}
