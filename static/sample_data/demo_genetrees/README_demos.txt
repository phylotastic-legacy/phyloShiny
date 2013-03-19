This is a revised system for managing demo files.  

The files are placed in the subdirectory static/sample_data/demo_genetrees. Any file that satisfies the assumptions below should work if it is placed in this directory and named with the "demo_" prefix.  Currently, it is assumed that these are Newick files with the "embedded ids" style of names, and that we are going to match against the Bininda-Emonds mammals tree. 

The demo names appear in the Reconciliotastic pull-down menu by virtue of the following code in reconciliotastic.py, which matches on the demo_ prefix: 

    datalist = os.listdir(os.curdir+'/applications/shiny/static/sample_data/demo_genetrees')
    datalist = [n.split('_',1)[1] for n in datalist if n.split('_')[0] == 'demo']

The file path is reconstructed later in phylotastic.js with the following: 

	treeFileName = '/sample_data/demo_genetrees/demo_'+treeName; 


