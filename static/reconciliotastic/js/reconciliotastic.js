var treeFileName = '';

$(function() {
	$( '#progressbar' ).progressbar({
		value: 0
	});
});

function toggleDatasources() {
    var upload = document.dataform.elements['datasource'][1].checked;
    
    document.getElementById('demos').disabled = upload;
    document.getElementById('uploadFileName').disabled = !upload;
    document.getElementById('uploadSubmit').disabled = !upload;
    
    document.getElementById('reconcileSubmit').disabled = false
}

function enableSubmit() {
    document.getElementById('reconcileSubmit').disabled = false
}

$(function(){
    $('input.reconcileSubmit').click(function(){
        // close the about accordion
        if($('#accordion').accordion('option','active') == 0)
            $('#accordion').accordion('option','active',false);
            
        // remove old tabs
        var len = $('#tabs').tabs('length');
        for(var i = 0; i < len; i++)
            $('#tabs').tabs('remove',0);
        
        // reset progress bar
        $( '#progressbar' ).progressbar( 'option', 'value', 0 );
        
        treeFileName = '';
        
        // user wants to upload data, deal with it...
        if(document.dataform.elements['datasource'][1].checked)
        {
            console.log('This functionality is not yet implemented in this demo.');
            // alert('This functionality is not yet implemented in this demo.');
            return;
        }
        else {
            var treeName = document.dataform.elements['demos'][document.dataform.elements['demos'].selectedIndex].value;
           if(treeName == 'Mammal'){
               treeFileName = '/sample_data/primate_tubulin_test1/primate_tubulin_embedded_ids.nwk.txt';
           } 
           else {
               console.log('This functionality is not yet implemented in this demo.');
            return;
           }
        }
        document.getElementById('reconcileSubmit').disabled = true
        // make the new tabs
        document.getElementById('progressContent').innerHTML = "Loading gene tree into Archaeopteryx...<br>"
        
        addArchTab(treeFileName, 'GeneTree', 'Gene Tree')
        updateProgress(35,'Getting species list corresponding to the selected gene tree...<br>')
        
        $.ajax({ url: 'getSpeciesList',
                data: {treefn: treeFileName},
                success: getPhylotasticTree});
    })
});

function updateProgress(percent, message) {
    $( '#progressbar' ).progressbar( 'option', 'value', percent );
    document.getElementById('progressDone').innerHTML += document.getElementById('progressContent').innerHTML
    document.getElementById('progressContent').innerHTML = message
}

function addArchTab(treeFileName, divid, tabname) {
    var tabshtml = '';
    tabshtml += '<div><img id=\"loading\" class=\"loading\"></div>';
    tabshtml += '<applet archive=\"'+baseURL+'/lib/archaeopteryx_applets.jar\"';
    tabshtml += 'code=\"org.forester.archaeopteryx.ArchaeopteryxE.class\" codebase=\"'+baseURL+'/lib\" width=\"800\" height=\"500\" alt=\"ArchaeopteryxE is not working on your system (requires at least Sun Java 1.5)!\"><param name=\"url_of_tree_to_load\" value=\"'+baseURL+treeFileName+'\"><param name=\"config_file\" value=\"\"><param name=\"java_arguments\" value=\"-Xmx512m\">';
    tabshtml += '</applet>';
    addTab(divid,tabname,tabshtml);
    $(function() {
    	$('.tabs-bottom .ui-tabs-nav, .tabs-bottom .ui-tabs-nav > *')
    		.removeClass('ui-corner-all ui-corner-top')
    		.addClass('ui-corner-bottom viz');
    });
}

function getPhylotasticTree(response) {
    var rv = eval('('+response+')')
    var species = rv['keptNodes']
    var speciesString = '';
    for(var i = 0; i < species.length; i++)
        speciesString = species[i].replace(' ','_') + ','
    speciesString = speciesString.slice(0, -1)
    
    updateProgress(55, 'Getting Phylotastic! tree that corresponds to found species...<br>')
    
    $.ajax({ url: 'getPhylotasticTree',
                data: { speciesString: speciesString, geneTreefn: treeFileName},
                success: reconcileTrees});
}

function reconcileTrees(response) {
    var rv = eval('('+response+')')
    var geneTree = rv['geneTreenm']
    var speciesTree = rv['speciesTreeName']
    
    addArchTab(speciesTree, 'SpeciesTree', 'Species Tree')
    
    updateProgress(65, 'Phylotastic! tree aquired, reconciling gene and species trees...<br>')
    $.ajax({ url: 'reconcileTrees',
                data: { geneTree:geneTree, speciesTree:speciesTree},
                success: showReconcileTree});
}

function showReconcileTree(response) {
    updateProgress(80,'Trees reconciled, loading reconcile tree into Archaeopteryx...<br>')
    var rv = eval('('+response+')')
    var reconcileTreefn = rv['reconcileTreeName']
    
    addArchTab(reconcileTreefn, 'ReconcileTree', 'Reconcile Tree')
    updateProgress(100, 'All trees loaded.')
}