// Acoustic Sentinel: saddle + housing. Stack inside (trunk side first):
// SS wear plate 13 x 1 mm, PZT disc 10 x 1 mm, tungsten-epoxy backing 12 x 6 mm,
// spring (wire 0.7, OD 13, free length 14), preamp PCB 22 mm disc, cap with cable gland.
include <phytohydra_params.scad>;
sad_w = 46; sad_h = 44; sad_t = 8;
h_od = 32; h_id = 26; h_len = 38;
aperture = 13.4;   // wear plate slides in this bore and protrudes 1.0 mm
difference() {
    union() {
        difference() {
            translate([trunk_r - 1, -sad_w/2, -sad_h/2]) cube([sad_t + 1, sad_w, sad_h]);
            cylinder(r = trunk_r, h = sad_h + 2, center = true);
        }
        translate([trunk_r + sad_t - 0.5, 0, 0]) rotate([0, 90, 0]) cylinder(d = h_od, h = h_len);
    }
    // bore for wear plate / PZT / backing stack, open to trunk
    translate([trunk_r - 2, 0, 0]) rotate([0, 90, 0]) cylinder(d = aperture, h = sad_t + 12);
    // main cavity for spring + preamp PCB, open at the back for the cap
    translate([trunk_r + sad_t + 8, 0, 0]) rotate([0, 90, 0]) cylinder(d = h_id, h = h_len);
    // strap slots
    for (s = [-1, 1]) translate([trunk_r + 2, s * (sad_w/2 - 5) - 2, -strap_w/2 - 0.5]) cube([strap_t + 0.6, 4, strap_w + 1]);
}
