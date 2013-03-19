# -*- coding: utf-8 -*-
# this file is released under public domain and you can use without limitations

#########################################################################
## This is a sample controller
## - index is the default action of any application
## - user is required for authentication and authorization
## - download is for downloading files uploaded in the db (does streaming)
## - call exposes all registered services (none by default)
#########################################################################
import os
import socket
import urllib2

def index():
#    datalist = os.listdir(os.curdir+'/applications/shiny/static/sample_data/')
#    datalist = [n.split('_')[1].split('.')[0] for n in datalist if n.split('_')[0] == 'namelist']
    datalist = os.listdir(os.curdir+'/applications/shiny/static/sample_data/demo_genetrees')
    datalist = [n.split('_',1)[1] for n in datalist if n.split('_')[0] == 'demo']
    return dict(datalist=datalist)

def getSpeciesList():
    inputTreeFP = request.vars.treefn
    shellCall = 'java -Xmx1024m -cp '
    shellCall += os.curdir+'/applications/shiny/static/lib/forester.jar '
    shellCall += 'org.forester.application.gene_tree_preprocess '
    shellCall += os.curdir+'/applications/shiny/static/'+inputTreeFP
    os.system(shellCall)
    
    prefix = os.curdir+'/applications/shiny/static/'+inputTreeFP[:-4]
    
    removedNodes = [l.strip() for l in open(prefix+'_removed_nodes.txt').readlines()]
    keptNodes = [l.strip() for l in open(prefix+'_species_present.txt').readlines()]
    processedGeneTree = [l.strip() for l in open(prefix+'_preprocessed_gene_tree.phylo.xml').readlines()]
    
    return response.json( dict(removedNodes = removedNodes, keptNodes = keptNodes, processedGeneTree = processedGeneTree))

def getPhylotasticTree():
    phylotasticURLbase = 'http://phylotastic-wg.nescent.org/script/phylotastic.cgi?species='
    speciesString = request.vars.speciesString
    speciesTreeURL = phylotasticURLbase+speciesString+'&tree=mammals&format=newick'
    speciesTree = urllib2.urlopen(speciesTreeURL)
    stree = speciesTree.read()
    geneTreefp = request.vars.geneTreefn
    
    geneTreeName = geneTreefp[:-4]
    speciesTreeName = geneTreeName+'_species_tree.txt'
    speciesTreefp =  os.curdir+'/applications/shiny/static'+geneTreeName+'_species_tree.txt'
    
    open(speciesTreefp,'w').write(stree)
    return response.json( dict(geneTreenm = geneTreeName, speciesTreeName = speciesTreeName))

def reconcileTrees():
    geneTreeName = request.vars.geneTree
    speciesTreefp = request.vars.speciesTree
    speciesTreeName = geneTreeName+'_species_tree.txt'
    shellCall = 'java -Xmx1024m -cp '
    shellCall += os.curdir+'/applications/shiny/static/lib/forester.jar '
    shellCall += 'org.forester.application.gsdi '
    shellCall += '-m -q '
    shellCall += os.curdir+'/applications/shiny/static'+geneTreeName+'_preprocessed_gene_tree.phylo.xml '
    shellCall += speciesTreefp+' '
    
    os.system(shellCall)
    
    recTreefp = geneTreeName+'_preprocessed_gene_tree.phylo_gsdi_out.phylo.xml'
    
    return response.json( dict(reconcileTreeName = recTreefp, speciesTreeName = speciesTreeName))