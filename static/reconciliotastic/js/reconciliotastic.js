// Function called if an ajax call fails. Tries to update the most
// recent "stage" DIV with an error message.
function failureFn(error) {
  if (app.lastId) {
    updateStatus({
      id: app.lastId,
      msg: ['Oops &mdash; there was a server error.<br/>',
        'Try reloading the page, or contact support@phylotastic.org'].join(''),
      status: 'running'
    });
  }
}

// Updates the status of a specified "stage", which is one of the
// three progress-indicating DIVs on the left side. 'params' is an
// object with key-value pairs.
function updateStatus(params) {
  var id = params.id;
  var el = $('#' + id);

  // Store this 'stage' ID in case we have a failure and want to give
  // it an error message; see failureFn
  app.lastId = id;

  if (params.status) {
    // Clear existing CSS classes, add the current status (usually
    // 'running' or 'finished').
    el.removeClass('ready running finished');
    el.addClass(params.status);
  }

  if (params.msg !== undefined) {
    // Update the message DIV
    el.find('.msg').html(params.msg);
  }
}

function openTreeView(file, header) {
  // Opens a window to show the tree indicated by the given file
  // name. Passes the current 'treeName' as a parameter, as well as a
  // header giving some context to the visualized tree.
  window.open('visualize?header=' + header + '&treeName=' + app.treeName + '&file=' + file + '');
}

function createVizLink(data) {
  // Returns the HTML for a <a href.../> link to visualize the given
  // tree. 'data' is the data directly returned from the controller
  // Ajax call.
  return[
  '<a class="viz-link" tree-file="' + data.vizFile + '"',
  ' tree-label="' + data.vizLabel + '">Click to view</a>', ].join('');
}

// Store some "global" variables within this app object.
var app = {
  treeName: undefined,
  treeFileName: undefined
};

$(function() {

  var button = $('button#reconcileSubmit');

  // Create the accordion panels
  $(".innerAccordion").accordion({
    collapsible: true,
    heightStyle: 'fill'
  });

  var onSelect = function() {
    var val = this.value;
    if (!val.match(/select a demo/i)) {
      // Enable the button if users chose a non-empty value.
      button.removeAttr('disabled');
    }
  };
  $('select#demos').on('change', onSelect);
  $('select#demos').on('click', onSelect);

  // Add a click listener to the whole body. Within the event
  // listener, we only listen for click events on <a> elements with a
  // "tree-file" attribute... these are the tree-viz links, so we call
  // the openTreeView function with appropriate arguments.
  $('body').on('click', function(event) {
    var aTarget = $(event.target).closest('a');
    if (aTarget.length > 0) {
      if (aTarget.attr('tree-file')) {
        openTreeView(aTarget.attr('tree-file'), aTarget.attr('tree-label'));
      }
    }
  });

  // Main workflow is triggered by button click.
  button.on('click', function() {

    // Get the tree name from the <select> element
    var treeName = document.dataform.elements['demos'][document.dataform.elements['demos'].selectedIndex].value;
    // Store the raw tree name
    app.treeName = treeName;
    // Store a filename including the whole folder structure.
    app.treeFileName = 'static/sample_data/demo_' + treeName + '/input_genetree.nwk.txt';

    // Disable the submit button.
    button.attr('disabled', 'disabled');

    // Begin the first stage.
    $('.stages').removeClass('inactive');
    var stages = $('.stages .stage');
    for (var i = 0; i < stages.length; i++) {
      updateStatus({
        id: stages[i].id,
        msg: '',
        status: 'ready'
      });
    }

    // Update the appropriate status panel
    updateStatus({
      id: 'getSpeciesList',
      status: 'running',
      msg: 'Loading gene tree and extracting species names...'
    });

    // Send the Ajax query (calls the getSpeciesList method within
    // controllers/reconciliotastic.py)
    $.ajax({
      url: 'getSpeciesList',
      data: {
        // Note: this is the only param passed for all of the Ajax
        // calls... it's all we need to track the state of this
        // request (for now). Things would get more complicated if we
        // allowed user input.
        treeFileName: app.treeFileName
      },
      success: getPhylotasticTree,
      failure: failureFn
    });
  })
});

function getPhylotasticTree(response) {
  // Response returned from controllers/reconciliotastic.py#getSpeciesList
  var data = JSON.parse(response);

  var keptCount = data.keptNodes.length;
  var removedCount = data.removedNodes.length;

  var msg = [
    createVizLink(data),
    'Gene tree loading complete.<br/>',
    'Identified <b>' + keptCount + ' species</b> in the tree.',

    ].join('');
  updateStatus({
    id: 'getSpeciesList',
    status: 'finished',
    msg: msg
  });

  // Carry on to the next Ajax call...
  setTimeout(function() {
    updateStatus({
      id: 'getPhylotasticTree',
      status: 'running',
      msg: 'Calling Phylotastic! to extract species tree...'
    });

    $.ajax({
      url: 'getPhylotasticTree',
      data: {
        treeFileName: app.treeFileName
      },
      success: reconcileTrees,
      failure: failureFn
    });
  },
  500);
}

function reconcileTrees(response) {
  var data = JSON.parse(response);
  var speciesTreeFile = data.speciesTreeFile;

  var msg = [
    createVizLink(data),
    'Species tree extraction complete.', ].join('');

  updateStatus({
    id: 'getPhylotasticTree',
    status: 'finished',
    msg: msg
  });

  setTimeout(function() {
    updateStatus({
      id: 'reconcileTrees',
      status: 'running',
      msg: 'Reconciling the gene tree and species tree...'
    });

    $.ajax({
      url: 'reconcileTrees',
      data: {
        treeFileName: app.treeFileName
      },
      success: showReconciledTree,
      failure: failureFn
    });
  },
  500);
}

function showReconciledTree(response) {
  var data = JSON.parse(response);

  var msg = [
    createVizLink(data),
    'Successfully reconciled the gene tree.<br/>',
    'Red nodes are duplications, green are speciations.'].join('');
  updateStatus({
    id: 'reconcileTrees',
    status: 'finished',
    msg: msg
  });
}
