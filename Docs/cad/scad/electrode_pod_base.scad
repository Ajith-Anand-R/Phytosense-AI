// Electrode pod base: curved saddle that conforms to the trunk,
// pocket for the pod PCB, through-hole for the Ti micro-pin, PT1000 pocket, strap slots.
include <phytohydra_params.scad>;
pod_w   = 40;   // tangential width
pod_h   = 36;   // height along trunk
base_t  = 9.5;  // thickness at centreline
pin_d   = 1.2;  // Ti micro-pin clearance hole (pin is 1.0 mm)
pin_z   = 6;    // pin offset above pod centre
pt_d    = 4.2;  // PT1000 button pocket
pt_z    = -8;
pcb_w   = 30; pcb_h = 26; pcb_t = 3.0;   // PCB pocket on outer face

module saddle() {
    // slab bounded by the trunk cylinder on the inside
    difference() {
        translate([trunk_r - 1, -pod_w/2, -pod_h/2]) cube([base_t + 1, pod_w, pod_h]);
        cylinder(r = trunk_r, h = pod_h + 2, center = true);
    }
}
difference() {
    saddle();
    // PCB pocket on the outer face
    translate([trunk_r + base_t - pcb_t, -pcb_w/2, -pcb_h/2]) cube([pcb_t + 1, pcb_w, pcb_h]);
    // micro-pin through hole (radial)
    translate([trunk_r - 2, 0, pin_z]) rotate([0, 90, 0]) cylinder(d = pin_d, h = base_t + 4, $fn = 24);
    // PT1000 pocket open to the trunk side
    translate([trunk_r - 2, 0, pt_z]) rotate([0, 90, 0]) cylinder(d = pt_d, h = 5, $fn = 32);
    // strap slots through the base, tangential
    for (s = [-1, 1])
        translate([trunk_r + 2, s * (pod_w/2 - 4) - 2, -strap_w/2 - 0.5]) cube([strap_t + 0.6, 4, strap_w + 1]);
    // 4 x M2 screw holes for the cover
    for (y = [-pod_w/2 + 4, pod_w/2 - 4], z = [-pod_h/2 + 4, pod_h/2 - 4])
        translate([trunk_r + 2, y, z]) rotate([0, 90, 0]) cylinder(d = 1.7, h = base_t + 2, $fn = 16);
}
