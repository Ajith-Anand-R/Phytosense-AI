// Edge Hub mounting saddle: curved back for the trunk, 4 bosses for a
// 160 x 110 mm IP67 polycarbonate box, two slots for 20 mm stainless band clamps.
include <phytohydra_params.scad>;
sad_w = 120; sad_h = 110; sad_t = 12;
box_w = 160; box_h = 110; boss_pitch_w = 140; boss_pitch_h = 90;
difference() {
    union() {
        difference() {
            translate([trunk_r - 1, -sad_w/2, -sad_h/2]) cube([sad_t + 1, sad_w, sad_h]);
            cylinder(r = trunk_r, h = sad_h + 2, center = true);
        }
        // flat mounting plate
        translate([trunk_r + sad_t - 1, -box_w/2, -box_h/2]) cube([4, box_w, box_h]);
        for (y = [-boss_pitch_w/2, boss_pitch_w/2], z = [-boss_pitch_h/2, boss_pitch_h/2])
            translate([trunk_r + sad_t + 3, y, z]) rotate([0, 90, 0]) cylinder(d = 10, h = 6, $fn = 40);
    }
    for (y = [-boss_pitch_w/2, boss_pitch_w/2], z = [-boss_pitch_h/2, boss_pitch_h/2])
        translate([trunk_r + sad_t - 2, y, z]) rotate([0, 90, 0]) cylinder(d = 4.2, h = 12, $fn = 24); // M4 heat-set insert
    for (z = [-40, 40]) translate([trunk_r + 2, -sad_w/2 - 1, z - strap_w/2 - 0.5]) cube([3, sad_w + 2, strap_w + 1]);
    // cable comb notches at the bottom edge
    for (i = [0:5]) translate([trunk_r + sad_t, -62 + i * 24.8 - 4, -box_h/2 - 1]) cube([6, 8, 8]);
}
