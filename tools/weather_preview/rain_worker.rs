/*
 * CDDL HEADER START
 * This file and its contents are supplied under the terms of the Common
 * Development and Distribution License ("CDDL"), version 1.0. You may only use
 * this file in accordance with version 1.0 of the CDDL. A full copy accompanies
 * this source in third_party/librain/COPYING.txt, also available from
 * http://www.illumos.org/license/CDDL.
 * CDDL HEADER END
 * Copyright 2019 Saso Kiselkov. All rights reserved.
 * Map2Lap adaptations: Windows worker, metric glass chart, swept car wipers.
 */
//! CPU port of librain droplets.glsl: particle state only. Depth rasterization,
//! normals, refraction and smudge remain GPU passes. No camera inputs in this ABI.
use std::{
    ffi::c_void,
    io::Write,
    ptr,
    sync::atomic::{fence, Ordering},
    time::Duration,
};

const CAP: usize = 4096;
const HISTORY: usize = 48;
const STREAMERS: usize = CAP / 16;
const MAGIC: u32 = 0x4d32524e;
const PROTOCOL: u32 = 4;
#[repr(C)]
struct Shared {
    magic: u32,
    protocol: u32,
    ac_pid: u32,
    request: u32,
    response: u32,
    shutdown: u32,
    count: [u32; 3],
    pad: u32,
    // dt, x0, width, s0, height, rain, gravity X/S/N, relative air X/S/N,
    // reset, slant exposure, ambient gain (diagnostic), reserved.
    params: [[f64; 16]; 3],
    blades: [[f64; 12]; 2],
    stats: [[f64; 4]; 3],
    // position XY, tail direction XY, radius, deformation, quantity, identity, velocity XY.
    drops: [[[f32; 10]; CAP]; 3],
    tails: [[[[f32; 4]; HISTORY]; STREAMERS]; 3],
    surface: [[[f32; 2]; 153]; 3],
}
#[derive(Clone, Copy, Default)]
struct V {
    x: f64,
    y: f64,
}
impl V {
    fn new(x: f64, y: f64) -> Self {
        Self { x, y }
    }
    fn add(self, b: Self) -> Self {
        Self::new(self.x + b.x, self.y + b.y)
    }
    fn sub(self, b: Self) -> Self {
        Self::new(self.x - b.x, self.y - b.y)
    }
    fn mul(self, s: f64) -> Self {
        Self::new(self.x * s, self.y * s)
    }
    fn len(self) -> f64 {
        self.x.hypot(self.y)
    }
    fn unit(self) -> Self {
        if self.len() > 1e-12 {
            self.mul(1. / self.len())
        } else {
            Self::default()
        }
    }
    fn mix(self, b: Self, t: f64) -> Self {
        self.mul(1. - t).add(b.mul(t))
    }
}
#[derive(Clone)]
struct Drop {
    pos: [V; HISTORY],
    valid: [bool; HISTORY],
    velocity: V,
    quant: f64,
    regen_t: f64,
    tail_v: V,
    bump_t: f64,
    drag: f64,
    bump_sz: f64,
    bump_rate: f64,
    bump_rate_t: f64,
    spd: f64,
    tail_t: f64,
    // Car-wiper coupling, absent from upstream's compute variant.
    blade: Option<usize>,
    radius: f64,
    direction: f64,
}
impl Default for Drop {
    fn default() -> Self {
        Self {
            pos: [V::default(); HISTORY],
            valid: [false; HISTORY],
            velocity: V::default(),
            quant: 0.,
            regen_t: 0.,
            tail_v: V::new(0., -1.),
            bump_t: 0.,
            drag: 0.,
            bump_sz: 0.,
            bump_rate: 0.,
            bump_rate_t: 0.,
            spd: 0.,
            tail_t: 0.,
            blade: None,
            radius: 0.,
            direction: 0.,
        }
    }
}
struct Pane {
    drops: Vec<Drop>,
    time: f64,
    random: u64,
}

// noise.glsl, Gold Noise Copyright 2017-2018 dcerisano@standard3d.com.
fn gold(p: V, seed: f64) -> f64 {
    let n = ((p.x * 0.1618033988749895 + p.y * 0.3141592653589793) * (seed + 0.1618033988749895))
        .sin()
        * 14142.13562373095;
    n - n.floor()
}
fn smooth(t: f64) -> f64 {
    let t = t.clamp(0., 1.);
    t * t * (3. - 2. * t)
}
fn slope(grid: &[[f32; 2]; 153], p: V, aspect: f64) -> V {
    let x = p.x.clamp(0., 1.) * 16.;
    let y = (p.y / aspect).clamp(0., 1.) * 8.;
    let i = (x.floor() as usize).min(15);
    let j = (y.floor() as usize).min(7);
    let k = i + j * 17;
    let v = |n: usize| V::new(grid[n][0] as f64, grid[n][1] as f64);
    v(k).mix(v(k + 1), x - i as f64)
        .mix(v(k + 17).mix(v(k + 18), x - i as f64), y - j as f64)
}
fn tangent(f: &[f64], h: V) -> V {
    let det = 1. + h.x * h.x + h.y * h.y;
    V::new(
        ((1. + h.y * h.y) * f[0] - h.x * h.y * f[1] + h.x * f[2]) / det,
        ((1. + h.x * h.x) * f[1] - h.x * h.y * f[0] + h.y * f[2]) / det,
    )
}
fn forces(p: V, params: &[f64; 16], grid: &[[f32; 2]; 153]) -> V {
    let h = slope(grid, p, params[4] / params[2]);
    let g = tangent(&params[6..9], h);
    let a = tangent(&params[9..12], h);
    let speed = (a.x * a.x + a.y * a.y + (h.x * a.x + h.y * a.y).powi(2)).sqrt();
    // rain_stage1_compute_move(): 0.15*(1.5-slant), linear normalized airflow.
    // Actual 3D tangents replace configurable radial force origins. Isotropic units
    // are fractions of pane WIDTH, so a rectangular texture cannot bend trajectories.
    // Slant already controls gravity magnitude in rain_stage1_compute_move().
    // Applying projected gravity magnitude again double-attenuated drainage.
    // librain.h recommends max_tas=90..100 m/s; start at 100 rather than the
    // earlier unvalidated car override of 40, which made modest driving lift water.
    g.unit()
        .mul(0.15 * (1.5 - params[13].clamp(0., 1.)))
        .add(a.unit().mul((speed / 100.).min(1.)))
}
fn inside(p: V, aspect: f64) -> bool {
    p.x > 0. && p.x < 1. && p.y > 0. && p.y < aspect
}
fn angle_at(p: V, w: &[f64; 12], params: &[f64; 16]) -> (f64, f64) {
    let x = p.x * params[2] + params[1] - w[0];
    let s = p.y * params[2] + params[3] - w[1];
    let a = x.atan2(s);
    let tau = std::f64::consts::TAU;
    (a + ((w[4] - a) / tau).round() * tau, x.hypot(s))
}
fn wiped(p: V, w: &[f64; 12], params: &[f64; 16]) -> bool {
    if w[8] < 0.5 {
        return false;
    }
    let (a, r) = angle_at(p, w, params);
    r >= w[2] && r <= w[3] * 1.02 && a >= w[5] && a <= w[6]
}
fn blade_position(radius: f64, w: &[f64; 12], params: &[f64; 16]) -> V {
    // Classic rain_stage1.frag's 0.8-degree leading strip. Carry collected drops
    // there once; never multiply their quantity or leave a parked clearing region.
    let a = w[4] + w[7] * 0.8_f64.to_radians();
    V::new(
        (w[0] + a.sin() * radius - params[1]) / params[2],
        (w[1] + a.cos() * radius - params[3]) / params[2],
    )
}
impl Pane {
    fn new(seed: u64) -> Self {
        Self {
            drops: vec![Drop::default(); CAP],
            time: 0.,
            random: seed,
        }
    }
    fn seeds(&mut self) -> [f64; 8] {
        // Host seed generator replaces libacfutils crc64_rand(); GLSL gold_noise remains.
        std::array::from_fn(|_| {
            self.random ^= self.random << 13;
            self.random ^= self.random >> 7;
            self.random ^= self.random << 17;
            (self.random % 1_000_000) as f64 / 1_000_000.
        })
    }
    fn step(
        &mut self,
        p: [f64; 16],
        blades: [[f64; 12]; 2],
        front: bool,
        out: &mut [[f32; 10]; CAP],
        tails: &mut [[[f32; 4]; HISTORY]; STREAMERS],
        grid: &[[f32; 2]; 153],
    ) -> (u32, [f64; 4]) {
        if !p.iter().all(|v| v.is_finite()) || p[2] < 0.1 || p[4] < 0.1 {
            return (0, [0.; 4]);
        }
        if p[12] != 0. {
            *self = Self::new(self.random.max(1));
        }
        let dt = p[0].clamp(0., 0.1);
        self.time += dt;
        let now = self.time;
        let seeds = self.seeds();
        let rain = p[5].clamp(0., 1.);
        let precip = rain.powf(0.7);
        let aspect = p[4] / p[2];
        let mut count = 0;
        let mut carried = 0;
        let mut moving = 0;
        for (id, d) in self.drops.iter_mut().enumerate() {
            let streamer = id % 16 == 0;
            let q = d.quant - dt;
            let exists = q > 0. && inside(d.pos[if streamer { 47 } else { 0 }], aspect);
            if !exists {
                d.quant = 0.;
                d.valid.fill(false);
                d.blade = None;
                if now - d.regen_t >= 0.5 + id as f64 / 1024. {
                    d.regen_t = now;
                    let coord = V::new(id as f64, 0.);
                    if gold(coord, seeds[4]) < precip {
                        let pos = V::new(gold(coord, seeds[5]), gold(coord, seeds[6]) * aspect);
                        d.pos.fill(pos);
                        d.valid.fill(true);
                        d.quant =
                            (20. + 60. * rain) + (120. - 20. - 60. * rain) * gold(coord, seeds[7]);
                        d.bump_sz = 0.;
                        d.velocity = forces(pos, &p, grid).mul(gold(pos, seeds[3]));
                        // Upstream leaves previous speed/drag/tail filters intact on regeneration.
                    }
                }
            } else {
                d.quant = q;
                if let Some(k) = d.blade {
                    let w = &blades[k];
                    if w[8] > 0.5 && w[7] * d.direction > 0. {
                        let next = blade_position(d.radius, w, &p);
                        d.pos.fill(next);
                        d.valid.fill(true);
                        d.velocity = V::default();
                    } else {
                        d.blade = None;
                        d.velocity = V::default();
                    }
                }
                if d.blade.is_none() {
                    let old = d.pos[0];
                    let force = forces(old, &p, grid);
                    d.spd += (d.velocity.len() - d.spd) * (dt / 0.2);
                    // update_static_drag_len(): preserve upstream's literal clamp, not a remapped fraction.
                    let target = 7.5 * (1. - d.spd.clamp(0., 0.01)) / q.max(1.);
                    d.drag += (target - d.drag) * (dt / 0.5);
                    if gold(old, seeds[2]) > 0.999 + (0.98 - 0.999) * precip {
                        d.drag = 0.;
                    }
                    let static_drag = force.unit().mul(-d.drag.min(force.len()));
                    d.velocity = d
                        .velocity
                        .add(force.sub(d.velocity).add(static_drag).mul(dt));
                    if now - d.bump_t >= 0.05 {
                        d.bump_t = now;
                        let speed = d.spd.clamp(0., 1.);
                        if gold(old, seeds[0]) >= 1. - (0.25 + 0.5 * speed) {
                            d.bump_sz = (20. - 19. * speed) / 2048. * (gold(old, seeds[1]) - 0.5);
                            d.velocity = d.velocity.mul(0.7);
                        }
                    }
                    let mut next = old.add(d.velocity.mul(dt));
                    if d.bump_sz != 0. {
                        if now - d.bump_rate_t >= 0.05 {
                            d.bump_rate = gold(old, seeds[1]);
                            d.bump_rate_t = now;
                        }
                        let displacement =
                            (d.spd * dt * d.bump_rate).min(d.bump_sz.abs()) * d.bump_sz.signum();
                        next =
                            next.add(V::new(d.velocity.y, -d.velocity.x).unit().mul(displacement));
                        d.bump_sz -= displacement;
                    }
                    if streamer {
                        if now - d.tail_t > 0.05 {
                            for j in (1..HISTORY).rev() {
                                d.pos[j] = d.pos[j - 1];
                                d.valid[j] = d.valid[j - 1];
                            }
                            d.tail_t = now;
                        }
                    } else {
                        d.pos[1] = old;
                        d.valid[1] = d.valid[0];
                    }
                    d.pos[0] = next;
                    d.valid[0] = true;
                    let delta = next.sub(old);
                    let target = if delta.len() > 0. {
                        delta.unit()
                    } else {
                        V::new(0., -1.)
                    };
                    let rate = 1. - smooth(d.spd / 0.02).clamp(0., 0.9);
                    d.tail_v = d.tail_v.mix(target, dt / rate);
                }
                if front {
                    for (k, w) in blades.iter().enumerate() {
                        if d.blade.is_none() && wiped(d.pos[0], w, &p) {
                            let (_, radius) = angle_at(d.pos[0], w, &p);
                            d.blade = Some(k);
                            d.radius = radius;
                            d.direction = w[7];
                            d.pos.fill(blade_position(radius, w, &p));
                            d.valid.fill(true);
                            d.velocity = V::default();
                            d.spd = 0.;
                            d.tail_v = V::new(0., -1.);
                        } else if streamer && d.blade.is_none() {
                            // Erase swept tail samples in persistent history, not just this image.
                            for j in 1..HISTORY {
                                if wiped(d.pos[j], w, &p) {
                                    d.valid[j] = false;
                                }
                            }
                        }
                    }
                }
            }
            if d.quant <= 0. {
                if streamer {
                    tails[id / 16].fill([0.; 4]);
                }
                continue;
            }
            let deform = (d.spd / 0.1).clamp(0., 1.);
            let quantity = d.quant * (1. - 0.5 * deform) / 120.;
            let radius = 10. * quantity / 2048.;
            out[count] = [
                d.pos[0].x as f32,
                d.pos[0].y as f32,
                d.tail_v.x as f32,
                d.tail_v.y as f32,
                radius as f32,
                deform as f32,
                quantity as f32,
                id as f32,
                d.velocity.x as f32,
                d.velocity.y as f32,
            ];
            count += 1;
            carried += usize::from(d.blade.is_some());
            moving += usize::from(d.spd > 0.001);
            if streamer {
                for j in 0..HISTORY {
                    tails[id / 16][j] = [
                        d.pos[j].x as f32,
                        d.pos[j].y as f32,
                        (quantity * (1. - j as f64 / 48.)) as f32,
                        if d.valid[j] && d.blade.is_none() {
                            1.
                        } else {
                            0.
                        },
                    ];
                }
            }
        }
        (count as u32, [moving as f64, carried as f64, now, 0.])
    }
}

#[link(name = "kernel32")]
extern "system" {
    fn CreateFileMappingW(
        file: *mut c_void,
        attrs: *const c_void,
        protect: u32,
        high: u32,
        low: u32,
        name: *const u16,
    ) -> *mut c_void;
    fn MapViewOfFile(
        handle: *mut c_void,
        access: u32,
        high: u32,
        low: u32,
        bytes: usize,
    ) -> *mut c_void;
    fn UnmapViewOfFile(address: *const c_void) -> i32;
    fn CloseHandle(handle: *mut c_void) -> i32;
    fn OpenProcess(access: u32, inherit: i32, pid: u32) -> *mut c_void;
    fn WaitForSingleObject(handle: *mut c_void, millis: u32) -> u32;
}
fn main() {
    let pid: u32 = std::env::args()
        .nth(1)
        .expect("AC PID required")
        .parse()
        .expect("Invalid PID");
    let name = "Local\\AcTools.CSP.Limited.Map2Lap.Librain.v4\0"
        .encode_utf16()
        .collect::<Vec<_>>();
    unsafe {
        let ac = OpenProcess(0x100000, 0, pid);
        assert!(!ac.is_null(), "Cannot open AC process");
        let bytes = std::mem::size_of::<Shared>();
        let handle = CreateFileMappingW(
            -1isize as *mut c_void,
            ptr::null(),
            4,
            0,
            bytes as u32,
            name.as_ptr(),
        );
        assert!(!handle.is_null(), "CreateFileMappingW failed");
        let mapping = MapViewOfFile(handle, 0x000f001f, 0, 0, bytes) as *mut Shared;
        assert!(!mapping.is_null(), "MapViewOfFile failed");
        assert!(
            ptr::read_volatile(ptr::addr_of!((*mapping).magic)) != MAGIC
                || ptr::read_volatile(ptr::addr_of!((*mapping).shutdown)) != 0,
            "Another rain worker owns this channel"
        );
        ptr::write_bytes(mapping.cast::<u8>(), 0, bytes);
        (*mapping).protocol = PROTOCOL;
        (*mapping).ac_pid = pid;
        fence(Ordering::Release);
        ptr::write_volatile(ptr::addr_of_mut!((*mapping).magic), MAGIC);
        println!("{{\"ready\":true,\"protocol\":{PROTOCOL},\"pid\":{},\"ac_pid\":{pid},\"bytes\":{bytes},\"capacity_per_pane\":{CAP}}}",std::process::id());
        std::io::stdout().flush().unwrap();
        let mut panes = [Pane::new(71131), Pane::new(58189), Pane::new(131071)];
        let mut previous = 0;
        while WaitForSingleObject(ac, 0) == 258 {
            if ptr::read_volatile(ptr::addr_of!((*mapping).shutdown)) != 0 {
                break;
            }
            let seq = ptr::read_volatile(ptr::addr_of!((*mapping).request));
            if seq == previous {
                std::thread::sleep(Duration::from_millis(1));
                continue;
            }
            fence(Ordering::Acquire);
            let shared = &mut *mapping;
            for (i, pane) in panes.iter_mut().enumerate() {
                let (count, stats) = pane.step(
                    shared.params[i],
                    shared.blades,
                    i == 0,
                    &mut shared.drops[i],
                    &mut shared.tails[i],
                    &shared.surface[i],
                );
                shared.count[i] = count;
                shared.stats[i] = stats;
            }
            fence(Ordering::Release);
            ptr::write_volatile(ptr::addr_of_mut!((*mapping).response), seq);
            previous = seq;
        }
        ptr::write_volatile(ptr::addr_of_mut!((*mapping).shutdown), 1);
        UnmapViewOfFile(mapping.cast());
        CloseHandle(handle);
        CloseHandle(ac);
    }
}
