#!/usr/bin/perl
#

=pod

=head1 NAME

 uncode_names.pl - made to uncode names in TNT trees from Goloboff, et al., 2009

=head1 SYNOPSIS

    uncode_names.pl --tree tree.nwk --names Taxon_Names_Only.tnt > uncoded_tree.nwk

    --help, --?         print help message

=head1 DESCRIPTION

This script was made specifically to convert the trees from Goloboff, et al 2009 so we could use them phylotastically.   It represents the last step in a 3-step process: 
 1. convert the TNT trees (in any of the *.tre files) to newick
 2. pick the tree you want and put it in a file by itself
 3. replace the numeric codes in the tree with species names from Taxon_Names_Only.tnt

=head1 BUGS

This assumes that there is one tree in the input file, although it would be easy to modify this to add a loop to process multiple trees. 

This is not very well tested.  I just made up some test trees like this: 

(73050,(73051,(73052,(73053,(73054,(73055,(73056,(73057,(73058,73059))))))));

(73059,(73058,(73052,(0,(73054,(30,(73056,(73057,(73051,73050))))))));

and then translated them using the file with the whole set of 76030 names (very fast). 

=head1 VERSION

June 8, 2012 (hackathon)

=head1 AUTHOR

Arlin Stoltzfus (arlin@umd.edu)

=cut

use strict; 
use Getopt::Long;
use Pod::Usage; 

my ($help, $namefile,$treefile); 
GetOptions(
    "names=s" => \$namefile,   
    "tree=s" => \$treefile, 
    "help|?" => \$help
    ) or pod2usage( "Invalid command-line options." );

pod2usage() if defined( $help ); 

open(TREE, $treefile) || die ("Cannot open $treefile: $!\n");
my $tree = <TREE>; 

# UNCODE THE NAMES
# 
open(NAMES, $namefile) || die ("Cannot open $namefile: $!\n");

my $code = 0; 
my $preamble = 1; 
while (<NAMES>){
  chomp;
  if ( $preamble ) { 
  	if ( m/\d+\s+\d+\s*$/ ) {  # match last line of preamble 
  		$preamble = 0; 
  	}
  	next; 
  }
  my $name = $_; 
  $name =~ s/____.*$//;  
  $name =~ s/Aporcelaimellus_cf\./Aporcelaimellus_cf2/; # disambiguate "A_cf" and "A_cf." clearly
  $name =~ s/\.//g;  # get rid of annoying periods in names
  $name =~ s/(.*)\s+0/$1/;  # handle idiosyncratic first name (only in Goloboff name file??) 
  
  # now we are ready to process the tree and increment the code
  $tree =~ s/\b$code\b/$name/;  # must use \b to prevent substituting number within number
  $code++; 
}
print $tree; 
exit(0);

# end