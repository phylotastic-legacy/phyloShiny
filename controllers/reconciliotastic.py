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
import urllib

def index():
    datalist = os.listdir(os.curdir+'/applications/shiny/static/sample_data/')
    datalist = [n.split('_')[1].split('.')[0] for n in datalist if n.split('_')[0] == 'namelist']
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

def getReconcileTree():
    speciesTreeURL = request.vars.phylotasticTreefn
    speciesTree = urllib.urlopen(speciesTreeURL)
    geneTreefp = request.vars.geneTreefn
    
    removedNodes = []
    return response.json( dict(removedNodes = removedNodes, speciesTree = speciesTree))