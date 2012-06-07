var treeFileName = '';


function toggleDatasources() {
    var upload = document.dataform.elements['datasource'][1].checked;
    
    document.getElementById('demos').disabled = upload;
    document.getElementById('uploadFileName').disabled = !upload;
    document.getElementById('uploadSubmit').disabled = !upload;
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
               treeFileName += '/sample_data/primate_tubulin_test1/primate_tubulin_embedded_ids.nwk.txt';
           } 
           else {
               console.log('This functionality is not yet implemented in this demo.');
            return;
           }
        }
        
        // make the new tabs
        var tabshtml = '';
        // var tabs = ['Reconcile Tree','Gene Tree','Species Tree'];
        // for(var i = 0; i < tabs.length; i++) {
            tabshtml = '<div><img id=\"loading\" class=\"loading\"></div>';
            tabshtml += '<applet archive=\"'+baseURL+'/lib/archaeopteryx_applets.jar\"';
            tabshtml += 'code=\"org.forester.archaeopteryx.ArchaeopteryxE.class\" codebase=\"'+baseURL+'/lib\" width=\"800\" height=\"500\" alt=\"ArchaeopteryxE is not working on your system (requires at least Sun Java 1.5)!\"><param name=\"url_of_tree_to_load\" value=\"'+baseURL+treeFileName+'\"><param name=\"config_file\" value=\"\"><param name=\"java_arguments\" value=\"-Xmx512m\">';
            tabshtml += '</applet>';
            addTab('GeneTree','Gene Tree',tabshtml);
        // }
        
        $(function() {
        	$('.tabs-bottom .ui-tabs-nav, .tabs-bottom .ui-tabs-nav > *')
        		.removeClass('ui-corner-all ui-corner-top')
        		.addClass('ui-corner-bottom viz');
        });
        
        $.ajax({ url: 'getSpeciesList',
                data: {treefn: treeFileName},
                success: getPhylotasticTree});
        
    })
});

function getPhylotasticTree(response) {
    var rv = eval('('+response+')')
    var species = rv['keptNodes']
    var phylotasticURLbase = 'http://phylotastic-wg.nescent.org/script/phylotastic.cgi?species='
    for(var i = 0; i < species.length; i++)
        phylotasticURLbase += species[i].replace(' ','_') + ','
    phylotasticURLbase = phylotasticURLbase.slice(0, -1)
    phylotasticURLbase += '&tree=mammals&format=newick'
    $.ajax({ url: 'getReconcileTree',
                data: {phylotasticTreefn: phylotasticURLbase, geneTreefn: treeFileName},
                success: showReconcileTree});
}

function showReconcileTree(response) {
    var rv = eval('('+response+')')
    console.log(rv)
}