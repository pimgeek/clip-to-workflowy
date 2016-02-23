#!/usr/bin/perl -CS

use strict;
use warnings;
use utf8;

use XML::Twig;
use Color::Calc(OutputFormat => 'hex', Prefix => 'color');
use Getopt::Long;

# magic scaling to make the units come out right
use constant
{
  SIZE_SCALE => 1/72, # positions are in points, but sizes aren't?
  FONT_SCALE => 2,    # XXX Promot apparently doesn't export real font
                      # sizes to gxl so the font sizes are bogus
                      # anyway. this is hack to make this file work.
  EDGE_SCALE => 4,    # line thickness
  LABEL_CUTOFF => 0, # XXX width cutoff below which we hide labels
  MAX_FADE   => 0.8,  # fade amount (out of 1) for 0-weight edges
};

sub normalize_id;
sub normalize_color;
sub quote;

my @nodes;
my $cur_node;
my $cur_edge;
my %oldid_to_newid;
my %edge_weights;
my $num_edges = 0;


my %shape_map =
  (
   diamond        => 'diamond',
   ellipse        => 'ellipse',
   hexagon        => 'hexagon',
   rectangle      => 'box',
   roundrectangle => 'box',
   RECTANGLE      => 'box',
   ELLIPSE        => 'ellipse',
   HEXAGON        => 'hexagon',
   DIAMOND        => 'diamond',
   RHOMBUS        => 'parallelogram',
   OCTAGON        => 'octagon',
   ROUNDED_RECTANGLE => 'Mrecord',
  );

my %style_map =
  (
    line          => 'solid',
    dashed        => 'dashed',
  );

my %y_arrow_type_map =
  (
    'none'        => 'none',
    'standard'    => 'normal',
    't_shape'     => 'tee',
  );

# I think these come from the constants in giny.view.EdgeView, namely the EDGE_COLOR_* ones.
# See http://csbi.sourceforge.net/API/constant-values.html#giny.view.EdgeView.EDGE_COLOR_ARROW
my %cy_arrow_type_map =
  (
    0  => 'none',
    3  => 'normal',
    6  => 'vee',
    9  => 'diamond',
    12 => 'dot',
    15 => 'tee',
  );


my (@edge_files, @edge_colors, $swap_edge_columns);
my $result = GetOptions(
  "edge-file=s"  => \@edge_files,
  "edge-color=s" => \@edge_colors,
  "swap-edge-columns" => \$swap_edge_columns,
);
if (@edge_files)
{
  parse_edgefile($_) or die("Couldn't open edge file '$_'\n") foreach @edge_files;
}
if ($num_edges != @edge_colors)
{
  die("Number of edges read ($num_edges) ",
      "and edge-colors (", scalar @edge_colors, ") must be equal\n");
}


# for Promot/CNO GML graphs:
# path to skip over the top-level single-node graph, as the nodes we
# really want are nested in the subgraph.  edges are all at the top
# level so no path is needed there. y: elements on the top-level graph
# node do end up getting parsed but are never printed.
my $gml_np = '/graphml/graph/node';

# for Cytoscape XGMML graphs:
# Same as above but there are no subgraphs and the root node is different.
my $xgmml_np = '/graph/node';

my $twig = XML::Twig->new
  (
   start_tag_handlers =>
   {
    $gml_np         => \&parse_gml_node,
    $xgmml_np       => \&parse_xgmml_node,
    'edge'          => \&parse_edge,
   },
   twig_handlers =>
   {
    $gml_np         => \&print_node,
    $xgmml_np       => \&print_node,
    'edge'          => \&print_edge,
    # gml-specific
    'y:Geometry'    => \&parse_geometry,
    'y:Fill'        => \&parse_fill,
    'y:BorderStyle' => \&parse_borderstyle,
    'y:NodeLabel'   => \&parse_nodelabel,
    'y:Shape'       => \&parse_shape,
    'y:LineStyle'   => \&parse_linestyle,
    'y:Arrows'      => \&parse_arrows,
    # gxmml-specific
    'node/graphics' => \&parse_xgmml_node_graphics,
    'edge/graphics' => \&parse_xgmml_edge_graphics,
   },
  );
print "digraph G {\n";
print "  rankdir=LR;\n";
print "  graph [fontname=\"simhei\" splines=\"polyline\"]\n";
print "  edge  [fontname=\"simhei\"]\n";
print "  node  [fontname=\"simhei\" shape=\"box\" width=\"1.68\" height=\"0.1\"]\n";

$twig->parsefile($ARGV[0]);
print "}\n";

#==========

sub parse_gml_node
{
  $cur_node = { __oldid => $_[1]->att('id') };
  push @nodes, $cur_node;
}


sub parse_xgmml_node
{
  parse_gml_node(@_);
  $cur_node->{id} = normalize_id($_[1]->att('label'));
}


sub parse_geometry
{
  $cur_node->{fixedsize} = 'true';
  $cur_node->{height}    = $_[1]->att('height') * SIZE_SCALE;
  $cur_node->{width}     = $_[1]->att('width') * SIZE_SCALE;
  # yfiles positions by corner, graphviz positions by center
  my $x = $_[1]->att('x') + $_[1]->att('width') / 2;
  # also, the Y axis is flipped
  my $y = -( $_[1]->att('y') + $_[1]->att('height') / 2 );
  $cur_node->{pos}       = quote "$x,$y" ;
}


sub parse_fill
{
  $cur_node->{fillcolor} = normalize_color $_[1]->att('color');
  $cur_node->{style}     = 'filled';
  # transparency? (unsupported in graphviz)
}


sub parse_borderstyle
{
  $cur_node->{color} = normalize_color $_[1]->att('color');
  # type? (only see "line" in this one sample file)
  # width? (unsupported in graphviz)
}


sub parse_nodelabel
{
  if ( $_[1]->att('width') >= LABEL_CUTOFF )
  {
    $cur_node->{label} = quote $_[1]->text;
  }
  else
  {
    $cur_node->{label} = quote '';
  }
  $cur_node->{id} = normalize_id $_[1]->text;
  # $cur_node->{fontsize} = $_[1]->att('fontSize') * FONT_SCALE;
  # $cur_node->{fontcolor} = normalize_color $_[1]->att('textColor');
  # $cur_node->{fontname} = quote $_[1]->att('fontFamily');
  # height/width appear to be the same as Geometry[height,width]
  # x has no obvious significance
  # attributes with only one value in this sample file:
  #   alignment=top, autoSizePolicy=content fontStyle=plain
  #   hasBackgroundColor=false modelName=internal modelPosition=c
  #   visibility=true
}


sub parse_shape
{
  my $type = $_[1]->att('type');
  $cur_node->{shape} = $shape_map{$type};
  defined $cur_node->{shape} or die "No mapping for shape type '$type' (edit \%shape_map)";
}


# gxmml
sub parse_xgmml_node_graphics
{
  parse_shape(@_);
  $cur_node->{width} = $_[1]->att('w') * SIZE_SCALE;
  $cur_node->{height} = $_[1]->att('h') * SIZE_SCALE;
  $cur_node->{fixedsize} = 'true';
  my $x = $_[1]->att('x');
  my $y = -( $_[1]->att('y') );  # Y-axis is flipped
  $cur_node->{pos} = quote "$x,$y";
  $cur_node->{fillcolor} = normalize_color $_[1]->att('fill');
  $cur_node->{color} = normalize_color $_[1]->att('outline');
  $cur_node->{style} = 'filled';
  $cur_node->{penwidth} = $_[1]->att('width');
  my ($fontname, $fontunknown, $fontsize) = split(/-/, $_[1]->att('cy:nodeLabelFont'));
  $cur_node->{fontsize} = $fontsize;
  $cur_node->{fontname} = quote $fontname;
  # TODO: $cur_node->{fontcolor} = ???

  # TODO: cy:borderLineType
}


#==========


sub parse_edge
{
  my $source = $oldid_to_newid{$_[1]->att('source')};
  my $target = $oldid_to_newid{normalize_id $_[1]->att('target')};
  $cur_edge = { source => $source, target => $target };
}


sub parse_linestyle
{
  $cur_edge->{color} = normalize_color $_[1]->att('color');
  $cur_edge->{penwidth} = $_[1]->att('width') * EDGE_SCALE;
  $cur_edge->{style} = $style_map{$_[1]->att('type')};
}


sub parse_arrows
{
  my $head_type = $_[1]->att('target');
  my $tail_type = $_[1]->att('source');
  $cur_edge->{arrowhead} = $y_arrow_type_map{$head_type};
  $cur_edge->{arrowtail} = $y_arrow_type_map{$tail_type};
  defined $cur_edge->{arrowhead} or die("No mapping for edge type '$head_type'\n");
  defined $cur_edge->{arrowtail} or die("No mapping for edge type '$tail_type'\n"); 
}


sub parse_xgmml_edge_graphics
{
  $cur_edge->{color} = normalize_color $_[1]->att('fill');
  my $head_type = $_[1]->att('cy:targetArrow');
  my $tail_type = $_[1]->att('cy:sourceArrow');
  $cur_edge->{arrowhead} = $cy_arrow_type_map{$head_type};
  $cur_edge->{arrowtail} = $cy_arrow_type_map{$tail_type};
  defined $cur_edge->{arrowhead} or die("No mapping for edge type '$head_type'\n");
  defined $cur_edge->{arrowtail} or die("No mapping for edge type '$tail_type'\n"); 
}


#==========


sub print_node
{
  $oldid_to_newid{$cur_node->{__oldid}} = $cur_node->{id};
  print "  ";
	print "\"$cur_node->{id}\"";
  #print ' [';
  #print join(', ', map("$_=$cur_node->{$_}", grep {!/^__/} keys %$cur_node));
  #print "]\n";
}


sub print_edge
{
  my @edge_list = ($cur_edge);

  my $weights = $edge_weights{$cur_edge->{source}}{$cur_edge->{target}};
  if ($weights)
  {
    @edge_list = ();
    my $all_identical = 1;
    my $i = 0;
    foreach my $weight (@$weights)
    {
      next unless defined $weight;
      my $new_edge = {%$cur_edge};
      $new_edge->{color} = normalize_color color_light($edge_colors[$i], (1 - $weight) * MAX_FADE);
      $new_edge->{penwidth} = ($weight + 0.4) * EDGE_SCALE;
      push @edge_list, $new_edge;
      $all_identical = undef if $weight != $weights->[0];
    }
    continue
    {
      $i++;
    }
    if ($num_edges > 1 and $all_identical)
    {
      splice(@edge_list, 1);
      $edge_list[0]->{color} = normalize_color color_light('black', (1 - $weights->[0]) * MAX_FADE);
    }
  }

  unshift(@edge_list, pop(@edge_list));
  foreach my $edge (@edge_list)
  {
	  print "  ";
    print "\"$edge->{'source'}\" -> \"$edge->{'target'}\"\n";
    #print ' [';
    #print join(', ', map("$_=$edge->{$_}", grep {!/^__/} keys %$edge));
    #print "]\n";
  }
}


#==========


sub normalize_id
{
  my ($id) = @_;
#  $id =~ tr/\W/_/d;
  return $id;
}


sub normalize_color
{
  my ($color) = $_[0] =~ /([a-f0-9]+)/i;
  return quote( '#' . '0' x (6 - length($color)) . $color );
}


sub quote
{
  return qq{"$_[0]"};
}


#==========


sub parse_edgefile
{
  my ($edgefile) = @_;

  open(EDGEFILE, '<', $edgefile) or return undef;

  # parse header to skip it and also determine number of weight columns
  my $header = <EDGEFILE>;
  my $re_comma = qr/,/;
  my $re_whitespace = qr/(?<=\S)\s+(?=\S)/;
  # =()= is an idiom to get counts from lists in scalar context, instead of
  # their last element -- see http://www.perlmonks.org/?node_id=527973
  my $num_commas = () = $header =~ /$re_comma/g;
  my $num_whitespaces = () = $header =~ /$re_whitespace/g;
  my ($delimiter, $num_weights);
  if ($num_commas >= 2)         { $delimiter = $re_comma; $num_weights = $num_commas - 1; }
  elsif ($num_whitespaces >= 2) { $delimiter = $re_whitespace; $num_weights = $num_whitespaces - 1;}
  else
  {
    die("$edgefile does not look like a delimited (commas or whitespace) file ",
        "or doesn't have at least three columns (target, source, weight)\n");
  }

  while (my $line = <EDGEFILE>)
  {
    $line =~ s/(^\s+|\s+$)//g;  # strip leading/trailing whitespace
    my ($target, $source, @weights) = map { /^"([^"]+)"$/ ? $1 : $_ } split($delimiter, $line);
    ($source, $target) = ($target, $source) if $swap_edge_columns;
    print STDERR "$source\t$target\t:\t", join("\t",@weights), "\n";

    splice(@{$edge_weights{$source}{$target}}, $num_edges, $num_weights, @weights);
  }
  $num_edges += $num_weights;

  close(EDGEFILE);
}
