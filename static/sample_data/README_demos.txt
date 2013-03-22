This is a revised system for managing demo files.  

The demo input gene trees are in 

  static/sample_data/demo_<NAME>/input_genetree.nwk.txt
  
where <NAME> is a name for the demo.  This name will appear in the pull-down menu.  Currently, it is assumed that the trees are Newick files with the "embedded ids" style of names, and that we are going to match against the Bininda-Emonds mammals tree. 

The demo names appear in the Reconciliotastic pull-down menu by virtue of the following code in reconciliotastic.py, which constructs datalist (should be re-named demolist?) by matching on the demo_ prefix: 

    datalist = os.listdir(os.curdir+'/applications/shiny/static/sample_data/')
    datalist = [n.split('_',1)[1] for n in datalist if n.split('_')[0] == 'demo']

The file path is reconstructed later in phylotastic.js with the following: 

	treeFileName = '/sample_data/demo_'+treeName+'/input_tree.nwk.txt'; 

where treeName is originally an item from datalist above.  
