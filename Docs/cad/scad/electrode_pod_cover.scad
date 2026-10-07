// Electrode pod cover with M8 connector boss (bottom exit, drip-safe)
include <phytohydra_params.scad>;
cov_w = 40; cov_h = 36; cov_d = 14;
difference() {
    union() {
        cube([cov_d, cov_w, cov_h], center = true);
        translate([0, 0, -cov_h/2 - 5]) cylinder(d = 12, h = 6, $fn = 48);   // M8 boss
    }
    translate([-wall, 0, 0]) cube([cov_d, cov_w - 2*wall, cov_h - 2*wall], center = true); // hollow, open toward base
    translate([0, 0, -cov_h/2 - 6]) cylinder(d = 8.2, h = 10, $fn = 48);                    // M8 thread bore (tap or insert)
    for (y = [-cov_w/2 + 4, cov_w/2 - 4], z = [-cov_h/2 + 4, cov_h/2 - 4])
        translate([-cov_d/2 - 1, y, z]) rotate([0, 90, 0]) cylinder(d = 2.2, h = cov_d + 2, $fn = 16);
}
