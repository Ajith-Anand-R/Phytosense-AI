// Screw-in style cap (press fit + 2 screws) with PG7 gland hole
include <phytohydra_params.scad>;
difference() {
    union() {
        cylinder(d = 32, h = 3);
        translate([0, 0, -6]) cylinder(d = 25.6, h = 6);   // spigot into housing (26 mm ID)
    }
    translate([0, 0, -7]) cylinder(d = 12.5, h = 12);       // PG7 gland
    translate([0, 0, -7]) cylinder(d = 21, h = 5);          // spring seat recess (sets preload with spigot depth)
}
