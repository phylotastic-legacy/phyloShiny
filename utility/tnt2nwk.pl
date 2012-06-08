#!/usr/bin/perl
#
=pod

=head1 NAME

 tnt2nwk.pl - made to convert TNT trees from Goloboff, et al., 2009

=head1 SYNOPSIS

    tnt2nwk.pl TNT_file_with_trees.tre > trees.nwk

discarded lines are echoed to stderr 

=head1 DESCRIPTION

This script was made specifically to convert the trees from Goloboff, et al 2009 so we could use them phylotastically.   It represents the first step in a 3-step process: 
 1. convert the TNT trees (in any of the *.tre files) to newick
 2. pick the tree you want and put it in a file by itself
 3. replace the numeric codes in the tree with species names from Taxon_Names_Only.tnt

I followed the directions here: 

http://tnt.insectmuseum.org/index.php/FAQ#How_can_I_export_trees_in_TNT_format_then_convert_them_to_Newick_format_in_an_automated_way.2C_with_a_Python_script.3F 

and found that this produced a parse-able Newick tree.  

=head1 BUGS

This worked for me on the Goloboff, et al. trees, but I have not tested it on other files from the TNT package.  

=head1 VERSION

$Id$

=head1 AUTHOR

Arlin Stoltzfus (arlin@umd.edu)

=cut

my $treefile = shift; 
open(TREES, $treefile) || die ("Cannot open $treefile: $!\n");
while (<TREES>) { 
	chomp; 
	if ( m/\)[;\*]\s*$/) {  # the tree lines seem to end with ")*" or ");" (last)
		s/\*\s*$/;/; # replace any * at the end of the lines with ";"
		s/\s+/,/g; # replace all whitespace with commas
		s/\)\(/),(/g; # replace ")(" with "),("
		s/,\)/)/g; # replace ",)" with ")"
		print "$_\n"; 
		}
	else { printf STDERR "Warning: discarded line '$_'\n"; } 
	}
exit(0); 
