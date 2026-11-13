//! Snow geometry worker for public CSP, using its documented limited shared-memory API.
//! The helper exits with its exact AC process handle. No game DLL, native hooks or external dependencies.
use std::{ffi::c_void, io::Write, ptr, sync::atomic::{fence, Ordering}, time::{Duration, Instant}};
const CAP: usize = 16383;
const MAGIC: u32 = 0x4d32534e;
#[repr(C)]
struct Shared {
    magic: u32, protocol: u32, ac_pid: u32, request: u32, response: u32, shutdown: u32,
    count: u32, drawn: u32, sheltered: u32, pad: u32, worker_us: f64,
    params: [f64; 20], roof_ix: [i32; 49], roof_iz: [i32; 49], roof_y: [f64; 49],
    seeds: [[f64; 7]; CAP], vertices: [[f32; 16]; CAP],
}
#[link(name = "kernel32")]
extern "system" {
    fn CreateFileMappingW(file: *mut c_void, attrs: *const c_void, protect: u32, high: u32, low: u32, name: *const u16) -> *mut c_void;
    fn MapViewOfFile(handle: *mut c_void, access: u32, high: u32, low: u32, bytes: usize) -> *mut c_void;
    fn UnmapViewOfFile(address: *const c_void) -> i32;
    fn CloseHandle(handle: *mut c_void) -> i32;
    fn OpenProcess(access: u32, inherit: i32, pid: u32) -> *mut c_void;
    fn WaitForSingleObject(handle: *mut c_void, millis: u32) -> u32;
}

fn geometry(shared: &mut Shared) {
    let p = shared.params;
    let (cx, cy, cz) = (p[3], p[4], p[5]);
    let mut drawn = 0;
    let mut covered_count = 0;
    for i in 0..(shared.count as usize).min(CAP) {
        let seed = shared.seeds[i];
        let (w, size, phase, aspect) = (seed[3], seed[4], seed[5], seed[6]);
        let x = (seed[0] + p[1] + (p[0] * (0.8 + w) + phase).sin() * 0.18 - cx + 14.0).rem_euclid(28.0) - 14.0;
        let y = (seed[1] - p[0] * (0.45 + w * 0.85) - cy + 7.0).rem_euclid(14.0) - 7.0;
        let z = (seed[2] + p[2] + (p[0] * 0.65 + phase).cos() * 0.15 - cz + 14.0).rem_euclid(28.0) - 14.0;
        let d2 = x * x + y * y + z * z;
        let ix = ((cx + x) / 4.0).floor() as i32;
        let iz = ((cz + z) / 4.0).floor() as i32;
        let slot = (ix.rem_euclid(7) * 7 + iz.rem_euclid(7)) as usize;
        let covered = shared.roof_ix[slot] == ix && shared.roof_iz[slot] == iz && cy + y < shared.roof_y[slot];
        if covered { covered_count += 1; }
        if !covered && d2 > 2.0 && d2 < 225.0 && x * p[6] + y * p[7] + z * p[8] > -0.3 {
            let distance = d2.sqrt();
            let pixel = p[9] * distance;
            let edge = ((15.0 - distance) / 4.0).min(1.0) * ((distance - 1.4) / 1.2).min(1.0);
            let width = (0.006 + w * w * 0.025) * size * p[16];
            let shown = (pixel * 14.0 * p[16]).min(width.max(pixel * 2.5 * p[16]));
            let (hw, hh) = (shown * 0.5, shown * aspect * 0.5);
            let sx = p[13] * hw; let sy = p[14] * hw; let sz = p[15] * hw;
            let ex = p[10] * hh; let ey = p[11] * hh; let ez = p[12] * hh;
            let alpha = ((0.5 + w * 0.3) * edge * 100.0).clamp(0.0, 99.0).floor();
            let packed = alpha + (((1.0 - distance / 4.0).max(0.0) * 9.0 + 0.5).floor()) * 100.0;
            let (wx, wy, wz) = (cx + x, cy + y, cz + z);
            shared.vertices[i] = [
                (wx - sx - ex) as f32, (wy - sy - ey) as f32, (wz - sz - ez) as f32, packed as f32,
                (wx - sx + ex) as f32, (wy - sy + ey) as f32, (wz - sz + ez) as f32, (packed + 0.998) as f32,
                (wx + sx + ex) as f32, (wy + sy + ey) as f32, (wz + sz + ez) as f32, (packed + 0.998) as f32,
                (wx + sx - ex) as f32, (wy + sy - ey) as f32, (wz + sz - ez) as f32, packed as f32,
            ];
            drawn += 1;
        } else {
            shared.vertices[i] = [cx as f32, (cy - 10000.0) as f32, cz as f32, 0.0,
                cx as f32, (cy - 10000.0) as f32, cz as f32, 0.0,
                cx as f32, (cy - 10000.0) as f32, cz as f32, 0.0,
                cx as f32, (cy - 10000.0) as f32, cz as f32, 0.0];
        }
    }
    shared.drawn = drawn;
    shared.sheltered = covered_count;
}

fn main() {
    let mut args = std::env::args().skip(1).collect::<Vec<_>>();
    // Isolated checks must never open the mapping belonging to a user's CSP session.
    let channel = if args.first().map(String::as_str) == Some("--channel") {
        assert!(args.len() >= 3, "--channel requires a name and target");
        let value = args.remove(1);
        args.remove(0);
        value
    } else { "Local\\AcTools.CSP.Limited.Map2Lap.SnowGeometry.v1".to_owned() };
    let ac_pid: u32 = if args.first().map(String::as_str) == Some("--launch-ac") {
        // Proton gives this child a Wine PID in CSP's mapping namespace, not a Linux PID.
        // Start AC first: a failed helper initialization still leaves the Lua fallback playable.
        assert!(args.len() >= 2, "--launch-ac requires the game executable");
        std::process::Command::new(&args[1]).args(&args[2..]).spawn().expect("Cannot start AC").id()
    } else { args.first().expect("AC process ID required").parse().expect("invalid PID") };
    let name = (channel + "\0").encode_utf16().collect::<Vec<_>>();
    unsafe {
        let ac = OpenProcess(0x100000, 0, ac_pid);
        assert!(!ac.is_null(), "Cannot open AC process");
        let bytes = std::mem::size_of::<Shared>();
        let handle = CreateFileMappingW(-1isize as *mut c_void, ptr::null(), 4, 0, bytes as u32, name.as_ptr());
        assert!(!handle.is_null(), "CreateFileMappingW failed: {}", std::io::Error::last_os_error());
        let mapping = MapViewOfFile(handle, 0x000f001f, 0, 0, bytes) as *mut Shared;
        assert!(!mapping.is_null(), "MapViewOfFile failed");
        if ptr::read_volatile(ptr::addr_of!((*mapping).magic)) == MAGIC && ptr::read_volatile(ptr::addr_of!((*mapping).shutdown)) == 0 {
            panic!("Another snow worker owns this channel");
        }
        ptr::write_bytes(mapping as *mut u8, 0, bytes);
        (*mapping).protocol = 1;
        (*mapping).ac_pid = ac_pid;
        fence(Ordering::Release);
        ptr::write_volatile(ptr::addr_of_mut!((*mapping).magic), MAGIC);
        println!("{{\"ready\":true,\"pid\":{},\"ac_pid\":{ac_pid},\"bytes\":{bytes},\"capacity\":{CAP}}}", std::process::id());
        std::io::stdout().flush().unwrap();
        let mut previous = 0;
        while WaitForSingleObject(ac, 0) == 258 {
            if ptr::read_volatile(ptr::addr_of!((*mapping).shutdown)) != 0 { break; }
            let seq = ptr::read_volatile(ptr::addr_of!((*mapping).request));
            if seq == previous { std::thread::sleep(Duration::from_millis(1)); continue; }
            fence(Ordering::Acquire);
            let shared = &mut *mapping;
            let t = Instant::now();
            geometry(shared);
            shared.worker_us = t.elapsed().as_secs_f64() * 1e6;
            fence(Ordering::Release);
            ptr::write_volatile(ptr::addr_of_mut!((*mapping).response), seq);
            previous = seq;
        }
        ptr::write_volatile(ptr::addr_of_mut!((*mapping).shutdown), 1);
        UnmapViewOfFile(mapping as *const c_void);
        CloseHandle(handle);
        CloseHandle(ac);
    }
}
