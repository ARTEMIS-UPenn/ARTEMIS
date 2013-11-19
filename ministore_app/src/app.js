/*function errorHandler(e) {
    console.error(e);
}

function displayPath(fileEntry) {
    chrome.fileSystem.getDisplayPath(fileEntry, function(path) {
	    $('#temp-text').html(path);
	});
}

function readAsText(fileEntry, callback) {
    fileEntry.file(function(file) {
	    var reader = new FileReader();
	    reader.onerror = errorHandler;
	    reader.onload = function(e) {
		callback(e.target.result);
	    };
	    reader.readAsText(file);
	});
}

function writeFileEntry(writableEntry, opt_blob, callback) {
    if (!writableEntry) {
	$('#temp-text').html('Nothing selected.');
	return;
    }

    writableEntry.createWriter(function(writer) {
	    writer.onerror = errorHandler;
	    writer.onwriteend = callback;

	    if (opt_blob) {
		writer.truncate(opt_blob.size);
		waitForIO(writer, function() {
			writer.seek(0);
			writer.write(opt_blob);
		    });
	    }
	    else {
		chosenFileEntry.file(function(file) {
			writer.truncate(file.fileSize);
			waitForIO(writer, function() {
				writer.seek(0);
				writer.write(file);
			    });
		    });
	    }
	}, errorHandler);
}

function waitForIO(writer, callback) {
    var start = Date.now();
    var reentrant = function() {
	if (writer.readyState===writer.WRITING && Date.now()-start<4000) {
	    setTimeout(reentrant, 100);
	    return;
	}
	if (writer.readyState===writer.WRITING) {
	    console.error("Write operation taking too long, aborting!"+
			  " (current writer readyState is "+writer.readyState+")");
	    writer.abort();
	}
	else {
	    callback();
	}
    };
    setTimeout(reentrant, 100);
}

var chosenFileEntry = null;
//var saveFileButton = $('#report');
//var chooseFileButton = $('#open-file-button');
//var textarea = $('#temp-content');
var output = 'fuckyougoogle';

function loadFileEntry(_chosenFileEntry) {
    chosenFileEntry = _chosenFileEntry;
    chosenFileEntry.file(function(file) {
	    readAsText(chosenFileEntry, function(result) {
		    $('#temp-text').html(result);
		});
	    saveFileButton.disabled = false;
	    displayPath(chosenFileEntry);
	});
}

function loadInitialFile(launchData) {
    if (launchData && launchData.items && launchData.items[0]) {
	loadFileEntry(launchData.items[0].entry);
    }
    else {
	chrome.storage.local.get('chosenFile',function(items) {
		if (items.chosenFile) {
		    chrome.fileSystem.restoreEntry(items.chosenFile, function(chosenEntry) {
			    if (chosenEntry) {
				loadFileEntry(chosenEntry);
			    }
			});
		}
	    });
    }
}
*/
var list=[];
$(document).ready(function() {
	$('#report-text').bind('keypress',function(e) {
		var code = e.keyCode || e.which;
		if(code == 13) {
		    $('#report-button').trigger('click');
		}
	    });
	/*
	$('#open-file-button').click(function(e) {
		var accepts = [{
			extensions: ['txt']
		    }];
		chrome.fileSystem.chooseEntry({type: 'openFile',accepts: accepts}, function(readOnlyEntry) {
			if (!readOnlyEntry) {
			    $('#temp-text').html('No file selected.');
			    return;
			}
			chrome.storage.local.set(
						 {'chosenFile': chrome.fileSystem.retainEntry(readOnlyEntry)});
			loadFileEntry(readOnlyEntry);
		    });
	    });
	*/
	$('#report-button').click(function(e) {
		/*
		var config = {type: 'saveFile',suggestedName: chosenFileEntry.name};
		chrome.fileSystem.chooseEntry(config, function(writableEntry) {
			var blob = new Blob([$('#temp-content').val() + '\n' + $('#report-text').val()], {type: 'text/plain'});
			writeFileEntry(writableEntry, blob, function(e) {
				$('#temp-text').html('Write complete :)');
			    });
		    });
		// animations indicating confirmation
		*/
		if ($('#report-text').val() != '')
		    list.push($('#report-text').val());
		$('#report-list').html('<option disabled>' + list.join('</option><option disabled>') + '</option>');
		$('#confirmation-text').show();
		$('#confirmation-text').css({'opacity':1});
		$('#confirmation-text').html("Thanks! So, a walrus and a penguin walk down the street. There's no joke here. We'll work on it.");
		$('#confirmation-text').stop().delay(2000).fadeOut(3000,function() {
			$('#confirmation-text').html("");
		    });
		$('#report-text').val('');
	    });
	/*
	var dnd = new DnDFileController('body', function(data) {
		chosenFileEntry = null;
		for (var i=0; i < data.items.length; i++) {
		    var item = data.items[i];
		    if (item.kind == 'file' && item.type.match('text/*') && item.webkitGetAsEntry()) {
			chosenFileEntry = item.webkitGetAsEntry();
			break;
		    }
		};
		if (!chosenFileEntry) {
		    $('#temp-text').html("Sorry. That's not a text file.");
		    return;
		}
		else {
		    $('#temp-text').html("Read text file.");
		}

		readAsText(chosenFileEntry, function(result) {
			$('#temp-content').html(result);
		    });
		//saveFileButton.disabled = false;
		displayPath(chosenFileEntry);
		});*/
    });