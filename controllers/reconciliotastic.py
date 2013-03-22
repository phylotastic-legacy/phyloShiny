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
from gluon import *

def index():
    rootFolder = current.request.folder
    folders = os.listdir(rootFolder+'static/sample_data/')

    # Go through the subfolders within sample_data, only keep folders
    # that match 'demo'
    folders = [x.split('_',1)[1] for x in folders if x.split('_')[0] == 'demo']
    folderLabels = [x.replace('_', ' ') for x in folders]

    # Return a list of tuples, like [ ['Mammal_Hemoglobin', 'Mammal Hemoglobin'] , ... ]
    # This lets us have nice display names in the <select> element in the view.
    foldersAndLabels = zip(folders, folderLabels)
    return dict(foldersAndLabels=foldersAndLabels)

def getFileName():
    # Returns the absolute filename for the "input" gene tree
    # file. Uses the treeFileName request parameter, as that's our
    # main state-tracking value passed between the view and controller
    # between each step.
    rootFolder = current.request.folder
    absoluteFileName = rootFolder+current.request.vars.treeFileName
    return absoluteFileName

def getRelativeWebPath(suffix):
    # Currently a no-op.
    return suffix

def visualize():
    # Visualize controller. Does some preprocessing before generating
    # the HTML for viewing a given tree.

    #Takes in the 'treeName' and 'file' params, and creates the URL
    #which can be used to access / download the given tree file.
    treeFile = current.request.vars.treeName
    suffix = current.request.vars.file
    treeUrl = URL('static', 'sample_data/demo_'+treeFile+'/input_genetree.nwk'+suffix,
                 scheme='http', host='phylotastic.nescent.org')

    return dict(treeUrl=treeUrl,
                header=current.request.vars.header)

def getSpeciesList():
    # Absolute file name of the input tree file.
    absoluteFileName = getFileName()
    # "Prefix", i.e. the input tree file without the ending
    # '.txt'. This is used as the prefix for all generated output
    # files
    filePrefix = absoluteFileName[:-4]

    shellCall = 'java -Xmx1024m -cp '
    shellCall += current.request.folder+'static/lib/forester.jar '
    shellCall += 'org.forester.application.gene_tree_preprocess '
    shellCall += absoluteFileName
    os.system(shellCall)

    removedNodes = [l.strip() for l in open(filePrefix+'_removed_nodes.txt').readlines()]
    keptNodes = [l.strip() for l in open(filePrefix+'_species_present.txt').readlines()]
    
    geneTreeFile = getRelativeWebPath('_preprocessed_gene_tree.phylo.xml')

    # Note: we always return the 'vizFile' and 'vizLabel' data values
    # from each Ajax call, as they're used consistently by the
    # front-end to generate visualization links.
    return response.json( dict(vizFile = geneTreeFile,
                               vizLabel = "Input Gene Tree",
                               removedNodes = removedNodes, 
                               keptNodes = keptNodes))

def getPhylotasticTree():
    absoluteFileName = getFileName()
    filePrefix = absoluteFileName[:-4]

    # Load the kept nodes and create the comma-delimited species
    # string for sending to PTastic
    speciesList = [l.strip() for l in open(filePrefix+'_species_present.txt').readlines()]
    # Need underscores instead of spaces
    speciesList = [x.replace(' ', '_') for x in speciesList]
    speciesString = ','.join(speciesList)

    phylotasticUrlBase = 'http://phylotastic-wg.nescent.org/script/phylotastic.cgi?species='
    speciesTreeUrl = phylotasticUrlBase+speciesString+'&tree=mammals&format=newick'
    conn = urllib2.urlopen(speciesTreeUrl)
    speciesTreeString = conn.read()
    speciesTreeString = speciesTreeString.strip()

    speciesTreeFilename = filePrefix+'_species_tree.txt'
    open(speciesTreeFilename,'w').write(speciesTreeString)

    # TODO: It would be nice here to count the number of species in
    # the returned species tree, so we can let users know if PTastic
    # found everything we searched for. This would require parsing the
    # Newick and counting nodes, probably using something like
    # BioPython rather than making an external call to Java again.

    speciesTreeWebFile = getRelativeWebPath('_species_tree.txt')

    return response.json( dict(vizFile = speciesTreeWebFile,
                               vizLabel = "Phylotastic Species Tree"
                               ) )

def reconcileTrees():
    absoluteFileName = getFileName()
    filePrefix = absoluteFileName[:-4]

    geneTreeFile = filePrefix+'_preprocessed_gene_tree.phylo.xml'
    speciesTreeFile = filePrefix+'_species_tree.txt'

    shellCall = 'java -Xmx1024m -cp '
    shellCall += current.request.folder+'static/lib/forester.jar '
    shellCall += 'org.forester.application.gsdi '
    shellCall += '-m -q '
    shellCall += geneTreeFile
    shellCall += ' '+speciesTreeFile

    os.system(shellCall)
    
    reconciledTreeWebFile = getRelativeWebPath('_preprocessed_gene_tree.phylo_gsdi_out.phylo.xml')
    
    return response.json( dict(vizFile = reconciledTreeWebFile,
                               vizLabel = "Reconciled Gene Tree"
                               ) )
