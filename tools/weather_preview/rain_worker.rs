//! Persistent rain droplets in car-glass X/S metres. A local grid joins pinned beads and running drops.
//! The protocol has no camera or screen coordinates. CSP bakes this same chart into private glass-mesh UVs.
//! The render thread exchanges one nonblocking request; the helper exits with the exact owned AC process.
use std::{ffi::c_void, io::Write, ptr, sync::atomic::{fence, Ordering}, time::Duration};

const CAP: usize = 4096;
const MAGIC: u32 = 0x4d32524e;
const CELL: f64 = 0.032;
#[repr(C)]
struct Shared {
    magic: u32, protocol: u32, ac_pid: u32, request: u32, response: u32, shutdown: u32,
    count: [u32; 3], pad: u32, reserved: f64,
    params: [[f64; 16]; 3], blades: [[f64; 12]; 2], stats: [[f64; 4]; 3],
    drops: [[[f32; 8]; CAP]; 3],
    trails: [[[f32; 4]; CAP]; 3],
    surface: [[[f32; 2]; 153]; 3],
}
#[derive(Clone, Copy, Default)]
struct Drop { x: f64, s: f64, px: f64, ps: f64, r: f64, vx: f64, vs: f64, adhesion: f64, age: f64, run: bool }
struct Pane {
    drops: Vec<Drop>, free: Vec<usize>, head: Vec<i32>, next: Vec<i32>, random: u32,
    budget: f64, ridge: [f64; 2], leak: [f64; 2], previous: [[f64; 12]; 2], idle: [f64; 2],
}
impl Pane {
    fn new(seed: u32) -> Self {
        Self { drops: vec![Drop::default(); CAP], free: (0..CAP).rev().collect(), head: vec![],
            next: vec![-1; CAP], random: seed, budget: 0., ridge: [0.; 2], leak: [0.; 2],
            previous: [[0.; 12]; 2], idle: [0.; 2] }
    }
    fn rand(&mut self) -> f64 {
        self.random ^= self.random << 13; self.random ^= self.random >> 17; self.random ^= self.random << 5;
        (self.random >> 8) as f64 / 16777216.
    }
    fn add(&mut self, x: f64, s: f64, r: f64, vx: f64, vs: f64) {
        let adhesion = 0.45 + self.rand() * 0.8;
        if let Some(i) = self.free.pop() {
            self.drops[i] = Drop { x, s, px: x, ps: s, r, vx, vs, adhesion, age: 0., run: false };
        } else {
            // At capacity incoming water grows the nearest real bead instead of disappearing at a hard limit.
            let mut best = 0; let mut distance = f64::MAX;
            for (i, d) in self.drops.iter().enumerate() {
                let dsq = (d.x - x).powi(2) + (d.s - s).powi(2);
                if dsq < distance { best = i; distance = dsq; }
            }
            let d = &mut self.drops[best];
            d.r = (d.r.powi(3) + r.powi(3)).cbrt();
        }
    }
    fn remove(&mut self, i: usize) { self.drops[i].r = 0.; self.free.push(i); }
    fn release(&mut self, k: usize, blade: [f64; 12]) {
        let v = self.ridge[k]; self.ridge[k] = 0.;
        if v < 1e-12 { return; }
        let n = ((v.cbrt() / 0.003).ceil() as usize).clamp(1, 12);
        let r = (v / n as f64).cbrt();
        for _ in 0..n {
            let t = 0.08 + self.rand() * 0.84;
            self.add(blade[4] + (blade[6] - blade[4]) * t + blade[8] * 0.008,
                blade[5] + (blade[7] - blade[5]) * t + blade[9] * 0.008, r, blade[8] * 0.03, blade[9] * 0.03);
        }
    }
    fn step(&mut self, p: [f64; 16], blades: [[f64; 12]; 2], front: bool,
        output: &mut [[f32; 8]; CAP], trails: &mut [[f32; 4]; CAP], surface: &[[f32; 2]; 153]) -> (u32, [f64; 4]) {
        let dt = p[0].clamp(0., 0.1);
        let (x0, xw, s0, sw) = (p[1], p[2], p[3], p[4]);
        if !xw.is_finite() || xw < 0.1 || sw < 0.1 { return (0, [0.; 4]); }
        if p[12] != 0. { *self = Pane::new(self.random.max(1)); }
        self.budget = (self.budget + p[5].clamp(0., 5000.) * dt).min(300.);
        while self.budget >= 1. {
            self.budget -= 1.;
            let x = x0 + self.rand() * xw; let s = s0 + self.rand() * sw;
            let r = 0.0009 + self.rand() * self.rand() * 0.0021;
            self.add(x, s, r, 0., 0.);
        }
        let mut release = vec![];
        for (i, d) in self.drops.iter_mut().enumerate() {
            if d.r == 0. { continue; }
            d.age += dt; d.px = d.x; d.ps = d.s;
            // Weight/adhesion scales as r², air drag/adhesion as r*v². Motion weakens contact-line pinning.
            // Sub-millimetre beads stay pinned; larger merged drops depin naturally on a sloped pane.
            // Free-stream wind hits the GLASS, not a free airborne particle. Near-wall shear is weaker,
            // recovering above the sheltered scuttle. Direct full wind on every bead made them fly upwards.
            let height = ((d.s - s0) / sw).clamp(0., 1.);
            let wall = if front { 0.26 + 0.40 * height.sqrt() } else { 0.55 };
            let shear = wall * wall;
            let (hx, hs) = surface_slope(surface, (d.x - x0) / xw, (d.s - s0) / sw);
            let (gx, gs) = tangent_components(p[6], p[7], p[13], hx, hs);
            let (ax, air_s) = tangent_components(p[8], p[9], p[14], hx, hs);
            let air_speed = ax.hypot(air_s);
            let fx = gx * d.r * d.r * 26000. + ax * air_speed * d.r * 1.4 * shear;
            let fs = gs * d.r * d.r * 26000. + air_s * air_speed * d.r * 1.4 * shear;
            let force = fx.hypot(fs);
            // Contact-line roughness creates local stick/slip instead of a sheet of equal-speed ellipses.
            let rough = 0.85 + 0.15 * (d.x * 913. + d.s * 487. + d.adhesion * 31.).sin();
            // Repeated impacts relax a pinned contact line over seconds; it must not stay frozen forever
            // while incoming rain is accumulating. No random lifetime deletion is involved.
            let relaxation = if p[11] > 0. { (1. - (d.age - 1.5).max(0.) * 0.12).max(0.18) } else { 1. };
            let threshold = d.adhesion * rough * relaxation * if d.run { 0.62 } else { 1. };
            let target = ((force - threshold).max(0.) * 0.045).min(0.16);
            let smoothing = 1. - (-dt / 0.07).exp();
            let (vx, vs) = if force > 1e-9 { (fx / force * target, fs / force * target) } else { (0., 0.) };
            d.vx += (vx - d.vx) * smoothing; d.vs += (vs - d.vs) * smoothing;
            d.run = d.vx.hypot(d.vs) > 0.0008;
            d.x += d.vx * dt; d.s += d.vs * dt;
            // Dry by shrinking the contact patch, not by expiring a random particle lifetime.
            if p[11] < 0.01 { d.r -= dt * 0.000018; }
            if d.x < x0 || d.x > x0 + xw || d.s < s0 || d.s > s0 + sw || d.r < 0.00025 { release.push(i); }
        }
        for i in release { self.remove(i); }
        let nx = (xw / CELL).ceil() as i32 + 1; let ns = (sw / CELL).ceil() as i32 + 1;
        self.head.resize((nx * ns) as usize, -1); self.head.fill(-1);
        for (i, d) in self.drops.iter().enumerate() {
            if d.r == 0. { continue; }
            let cell = ((d.x - x0) / CELL) as i32 + ((d.s - s0) / CELL) as i32 * nx;
            self.next[i] = self.head[cell as usize]; self.head[cell as usize] = i as i32;
        }
        let mut merges = 0;
        for i in 0..CAP {
            if self.drops[i].r == 0. { continue; }
            let cx = ((self.drops[i].x - x0) / CELL) as i32;
            let cs = ((self.drops[i].s - s0) / CELL) as i32;
            for sy in (cs - 1).max(0)..=(cs + 1).min(ns - 1) {
                for sx in (cx - 1).max(0)..=(cx + 1).min(nx - 1) {
                    let mut j = self.head[(sx + sy * nx) as usize];
                    while j >= 0 {
                        let jj = j as usize; j = self.next[jj];
                        if jj <= i || self.drops[jj].r == 0. { continue; }
                        let (a, b) = (self.drops[i], self.drops[jj]);
                        let swept = segment_distance(b.x, b.s, a.px, a.ps, a.x, a.s)
                            .min(segment_distance(a.x, a.s, b.px, b.ps, b.x, b.s));
                        if swept > (a.r + b.r) * 0.88 { continue; }
                        let (va, vb) = (a.r.powi(3), b.r.powi(3)); let v = va + vb;
                        let d = &mut self.drops[i];
                        // The moving drop keeps its leading contact point; water from the caught bead joins it.
                        // Centre averaging would visibly pull a fast drop backwards along its own cleared trail.
                        if b.run && !a.run { d.x = b.x; d.s = b.s; }
                        d.vx = (a.vx * va + b.vx * vb) / v; d.vs = (a.vs * va + b.vs * vb) / v;
                        d.r = v.cbrt(); d.run = a.run || b.run; d.adhesion = a.adhesion.min(b.adhesion);
                        self.remove(jj); merges += 1;
                    }
                }
            }
        }
        if front {
            for (k, blade) in blades.into_iter().enumerate() {
                let previous = self.previous[k];
                if blade[10] > 0.5 {
                    if previous[8] * blade[8] + previous[9] * blade[9] < -0.1 { self.release(k, previous); }
                    self.idle[k] = 0.;
                    let (ax, ay, bx, by) = if previous[11] > 0. { (previous[4], previous[5], previous[6], previous[7]) }
                        else { (blade[0], blade[1], blade[2], blade[3]) };
                    for i in 0..CAP {
                        let d = self.drops[i];
                        if d.r > 0. && (triangle(d.x, d.s, ax, ay, bx, by, blade[6], blade[7])
                            || triangle(d.x, d.s, ax, ay, blade[6], blade[7], blade[4], blade[5])
                            || segment_distance(d.x, d.s, blade[4], blade[5], blade[6], blade[7]) < d.r + 0.001) {
                            self.ridge[k] += d.r.powi(3); self.remove(i);
                        }
                    }
                    let leak = self.ridge[k] * (1. - (-dt * 0.7).exp());
                    self.ridge[k] -= leak; self.leak[k] += leak;
                    if self.leak[k] > 0.002_f64.powi(3) {
                        // Native blade chain order is not a reliable pivot indicator: drain at the lower tip.
                        let t = if blade[5] < blade[7] { 0. } else { 1. };
                        self.add(blade[4] + (blade[6] - blade[4]) * t - blade[8] * 0.009,
                            blade[5] + (blade[7] - blade[5]) * t - blade[9] * 0.009, self.leak[k].cbrt(), 0., -0.025);
                        self.leak[k] = 0.;
                    }
                } else {
                    self.idle[k] += dt;
                    if self.idle[k] > 0.25 { self.release(k, previous); }
                }
                self.previous[k] = blade;
            }
        }
        let mut count = 0; let mut moving = 0;
        for d in &self.drops {
            if d.r == 0. { continue; }
            let v = d.vx.hypot(d.vs); let stretch = (1. + v * 2.5).min(1.4).sqrt();
            let (ux, us) = if v > 0.0001 { (d.vx / v, d.vs / v) } else { (0., 1.) };
            output[count] = [d.x as f32, d.s as f32, (ux * d.r * stretch) as f32, (us * d.r * stretch) as f32,
                (-us * d.r / stretch) as f32, (ux * d.r / stretch) as f32, (d.r * 400. / 8.).min(1.) as f32,
                if v > 0.015 { 1. } else { 0. }];
            // Deposit at the receding contact edge. A centre-to-centre trail is hidden inside a slow drop's
            // next footprint, and would be overwritten by the dome before it could wet the persistent field.
            trails[count] = [(d.px - ux * d.r * stretch) as f32, (d.ps - us * d.r * stretch) as f32, (d.r * 0.22) as f32,
                if d.run && d.age > 0.03 { 0.36 } else { 0. }];
            count += 1; moving += usize::from(d.run);
        }
        (count as u32, [merges as f64, moving as f64, self.ridge[0], self.ridge[1]])
    }
}
// Bilinear derivatives of the actual car glass sampled once by Lua. Pure.
fn surface_slope(map: &[[f32; 2]; 153], x: f64, s: f64) -> (f64, f64) {
    let u = x.clamp(0., 1.) * 16.; let v = s.clamp(0., 1.) * 8.;
    let ix = (u.floor() as usize).min(15); let iy = (v.floor() as usize).min(7);
    let (tx, ty) = (u - ix as f64, v - iy as f64);
    let k = ix + iy * 17;
    let mut result = [0.; 2];
    for c in 0..2 {
        result[c] = (map[k][c] as f64 * (1. - tx) + map[k + 1][c] as f64 * tx) * (1. - ty)
            + (map[k + 17][c] as f64 * (1. - tx) + map[k + 18][c] as f64 * tx) * ty;
    }
    (result[0], result[1])
}
// Project a 3D force onto the curved glass, expressed in the existing X/S parameter coordinates.
// The inverse surface metric prevents a steep edge from inventing speed or pulling toward the driver. Pure.
fn tangent_components(x: f64, s: f64, n: f64, hx: f64, hs: f64) -> (f64, f64) {
    let inv = 1. / (1. + hx * hx + hs * hs);
    (((1. + hs * hs) * x - hx * hs * s + hx * n) * inv,
        ((1. + hx * hx) * s - hx * hs * x + hs * n) * inv)
}
fn segment_distance(x: f64, y: f64, ax: f64, ay: f64, bx: f64, by: f64) -> f64 {
    let (dx, dy) = (bx - ax, by - ay);
    let t = (((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy).max(1e-20)).clamp(0., 1.);
    (x - ax - dx * t).hypot(y - ay - dy * t)
}
fn triangle(x: f64, y: f64, ax: f64, ay: f64, bx: f64, by: f64, cx: f64, cy: f64) -> bool {
    let area = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
    if area.abs() < 1e-12 { return false; }
    let a = (bx - ax) * (y - ay) - (by - ay) * (x - ax);
    let b = (cx - bx) * (y - by) - (cy - by) * (x - bx);
    let c = (ax - cx) * (y - cy) - (ay - cy) * (x - cx);
    (a >= 0. && b >= 0. && c >= 0.) || (a <= 0. && b <= 0. && c <= 0.)
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
fn main() {
    let ac_pid: u32 = std::env::args().nth(1).expect("AC process ID required").parse().expect("invalid PID");
    let name = "Local\\AcTools.CSP.Limited.Map2Lap.RainHybrid.v3\0".encode_utf16().collect::<Vec<_>>();
    unsafe {
        let ac = OpenProcess(0x100000, 0, ac_pid); assert!(!ac.is_null(), "Cannot open AC process");
        let bytes = std::mem::size_of::<Shared>();
        let handle = CreateFileMappingW(-1isize as *mut c_void, ptr::null(), 4, 0, bytes as u32, name.as_ptr());
        assert!(!handle.is_null(), "CreateFileMappingW failed");
        let mapping = MapViewOfFile(handle, 0x000f001f, 0, 0, bytes) as *mut Shared;
        assert!(!mapping.is_null(), "MapViewOfFile failed");
        assert!(ptr::read_volatile(ptr::addr_of!((*mapping).magic)) != MAGIC || ptr::read_volatile(ptr::addr_of!((*mapping).shutdown)) != 0,
            "Another rain worker owns this channel");
        ptr::write_bytes(mapping as *mut u8, 0, bytes);
        (*mapping).protocol = 3; (*mapping).ac_pid = ac_pid;
        fence(Ordering::Release); ptr::write_volatile(ptr::addr_of_mut!((*mapping).magic), MAGIC);
        println!("{{\"ready\":true,\"pid\":{},\"ac_pid\":{ac_pid},\"bytes\":{bytes},\"capacity_per_pane\":{CAP}}}", std::process::id());
        std::io::stdout().flush().unwrap();
        let mut panes = [Pane::new(71131), Pane::new(58189), Pane::new(131071)];
        let mut previous = 0;
        while WaitForSingleObject(ac, 0) == 258 {
            if ptr::read_volatile(ptr::addr_of!((*mapping).shutdown)) != 0 { break; }
            let seq = ptr::read_volatile(ptr::addr_of!((*mapping).request));
            if seq == previous { std::thread::sleep(Duration::from_millis(1)); continue; }
            fence(Ordering::Acquire);
            let shared = &mut *mapping;
            for (i, pane) in panes.iter_mut().enumerate() {
                let (count, stats) = pane.step(shared.params[i], shared.blades, i == 0,
                    &mut shared.drops[i], &mut shared.trails[i], &shared.surface[i]);
                shared.count[i] = count; shared.stats[i] = stats;
            }
            fence(Ordering::Release); ptr::write_volatile(ptr::addr_of_mut!((*mapping).response), seq); previous = seq;
        }
        ptr::write_volatile(ptr::addr_of_mut!((*mapping).shutdown), 1);
        UnmapViewOfFile(mapping.cast()); CloseHandle(handle); CloseHandle(ac);
    }
}
