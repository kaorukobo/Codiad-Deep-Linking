/*
 *  Version 0.9
 *  Based on https://github.com/Codiad/Codiad/issues/360
 */

(function(global, $){
    
    // Define core
    var codiad = global.codiad,
        scripts= document.getElementsByTagName('script'),
        path = scripts[scripts.length-1].src.split('?')[0],
        curpath = path.split('/').slice(0, -1).join('/')+'/';

    codiad.deepLinking = {
        
        // Allows relative `this.path` linkage
        path: curpath,
		hashNavigationBlocked: false, //set to true to ignore the hash changes
		fullPath: '',
		parents: '#project-root',
		currFolders: [],
		loadedIndex: 0,
		pathLoadingInterval: 0,
		safetyBreak: 30, //prevent infinite loops
		
        init: function() {
			//set event and move to path if the hash is already set.
			$(window).on('hashchange', codiad.deepLinking.hashChanged);
			if(location.hash != "") codiad.deepLinking.hashChanged();
			//sync the hash on the viewed elements
			$('a.file, a.directory').live('dblclick', codiad.deepLinking.updateHash);
			$('#tab-list-active-files a.label, #tab-list-active-files a.close, #dropdown-list-active-files li>a, #dropdown-list-active-files span.label').live('click', codiad.deepLinking.updateHash);
        },
		updateHash: function(event)
		{
			elem = event.currentTarget;
			codiad.deepLinking.hashNavigationBlocked = true;
			pathAttr = 'data-path';
			if ($(elem).parents('#file-manager').length == 0)
			{
				elem = $('#tab-list-active-files .active a').get(0);
				pathAttr = 'title';
			}
			location.hash = '#' + $(elem).attr(pathAttr).replace($(elem).attr(pathAttr).split('/')[0], $('#project-list li[ondblclick$="' + $(elem).attr(pathAttr).split('/')[0] + '\');"]').text());
			setTimeout(function(){codiad.deepLinking.hashNavigationBlocked = false;}, 500);
		},
		hashChanged: function()
		{
			if(location.hash.substring(0,1) == "#" && !codiad.deepLinking.hashNavigationBlocked)
			{
				codiad.deepLinking.fullPath = location.hash.substring(1);
				if(codiad.deepLinking.fullPath != "")
				{
					$('#modal-overlay').show();
					clearInterval(codiad.deepLinking.pathLoadingInterval);
					//reset vars
					codiad.deepLinking.currFolders = codiad.deepLinking.fullPath.split('/');
					codiad.deepLinking.parents = '#project-root';
					codiad.deepLinking.safetyBreak = 30;
					codiad.deepLinking.loadedIndex = 0;
					//start loading path
					codiad.deepLinking.pathLoadingInterval = setInterval(codiad.deepLinking.loadPath, 500);
				}
			}
		},
		loadPath: function()
		{
			codiad.deepLinking.safetyBreak = codiad.deepLinking.safetyBreak -1;
			// chech if the path if fully loaded or if we need to break
			if (codiad.deepLinking.safetyBreak<0 || codiad.deepLinking.loadedIndex == codiad.deepLinking.currFolders.length)
			{
				clearInterval(codiad.deepLinking.pathLoadingInterval);
				$('#modal-overlay').hide();
				return;
			}

			if(codiad.deepLinking.loadedIndex == 0)
			{
				//the root of the path is the project. is loaded different than the directories.
				if($('#project-root').text() != codiad.deepLinking.currFolders[0])
				{
					$('#project-list li:contains(' + codiad.deepLinking.currFolders[0] + ')').dblclick();
					codiad.deepLinking.parents = codiad.deepLinking.parents + ':contains(' + codiad.deepLinking.currFolders[0] + ')';
				}
			}
			else
			{
				//get the parent path
				parentsSplit = codiad.deepLinking.parents.split('~ ul');
				currParent = $(parentsSplit[0]);
				for(i = 1; i<parentsSplit.length; i++)
				{
					currParent = currParent.siblings('ul').find(parentsSplit[i]);
				}

				//check if its open
				if(currParent.hasClass('open'))
				{
					linkType = 'directory';
					if(codiad.deepLinking.loadedIndex == codiad.deepLinking.currFolders.length - 1)
					{
						if(codiad.deepLinking.currFolders[codiad.deepLinking.loadedIndex].indexOf('.')!=-1)
						{
							//if it is the last and ther is a point in the name... is probably a file
							linkType = 'file';
						}
					}
					//move one level on the path
					codiad.deepLinking.parents = codiad.deepLinking.parents + ' ~ ul .' + linkType + '[data-path$="' + codiad.deepLinking.currFolders[codiad.deepLinking.loadedIndex] + '"]';
					parentsSplit = codiad.deepLinking.parents.split('~ ul');
					currParent = $(parentsSplit[0]);
					for(i = 1; i<parentsSplit.length; i++)
					{
						currParent = currParent.siblings('ul').find(parentsSplit[i]);
					}
					//check if the new parent is not open
					if(!currParent.hasClass('open'))
					{
						currParent.parent().children('span').click();
					}
				}
				else
				{
					//if it is not open, wait a little more.
					//this could be better implemented with callbacks on the filetree....
					return;
				}
			}
			//move the index level of the path
			codiad.deepLinking.loadedIndex = codiad.deepLinking.loadedIndex + 1;
		}

    };

    // Instantiates plugin
    $(function() {    
        codiad.deepLinking.init();
    });
	
})(this, jQuery);
