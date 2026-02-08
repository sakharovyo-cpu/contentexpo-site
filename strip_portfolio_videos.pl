use strict; use warnings;
local $/; my $t = <STDIN>;
$t =~ s/href=\"assets\/(vdnh_promo|crocus_shann|biznes_molodyh)\.mp4\"/href=\"#\" data-link=\"ADD_LINK_LATER\"/g;
$t =~ s/<video[^>]*src=\"assets\/(vdnh_promo|crocus_shann|biznes_molodyh)\.mp4\"[^>]*><\/video>/<img src=\"assets\/poster.jpg\" alt=\"Video\" loading=\"lazy\"\/>/g;
print $t;
