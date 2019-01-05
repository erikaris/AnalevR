<?php $this->load->view('templates/header'); ?>
<?php $this->load->view('developer/menu'); ?>

<script type="text/javascript" src="https://cdn.webix.com/edge/webix.js"></script>
<link rel="stylesheet" type="text/css" href="https://cdn.webix.com/edge/webix.css">

<script>var require = { paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.14.3/min/vs' } };</script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.14.3/min/vs/editor/editor.main.css">

<div class="content-wrap">
  <div class="main">
    <div class="container-fluid">
      <div class="row">
        <div class="col-lg-12 col-md-12 col-sm-12">
          <div class="page-header">
            <div class="row">
              <!-- Title -->
              <div class="col-lg-8 col-md-8 col-sm-6">
                <div class="page-title">
                  <h1>Dashboard</h1>
                </div>
              </div>

              <!-- Breadcrumb -->
              <div class="col-lg-4 col-md-4 col-sm-6">
                <div class="page-title">
                  <ol class="breadcrumb text-right">
                    <li><a href="<?php echo base_url() . 'user' ?>">Pengguna</a></li>
                    <li class="active">Dashboard</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="main_content"></div>
    </div>
  </div>
</div>

<script type="text/javascript">
	// Define new webix UI "Monaco editor"
	webix.protoUI({
	    name: "monaco-editor",
	    defaults: {
	        on: {
	            'onChange': function(e) {}
	        }
	    },
	    $init: function(config) {
	        this._waitEditor = webix.promise.defer();
	        this.$ready.push(this._render_cm_editor);
	    },
	    _render_cm_editor: function() {
	        webix.require([
	            "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.14.3/min/vs/loader.js",
	            "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.14.3/min/vs/editor/editor.main.nls.js",
	            "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.14.3/min/vs/editor/editor.main.js"
	        ], this._render_when_ready, this);
	    },
	    _render_when_ready: function() {
	        this._editor = monaco.editor.create(this.$view, {
	            language: 'javascript',
	            automaticLayout: true
	        });

	        this._editor.onDidChangeModelContent((e) => {
	            this.config.on.onChange(e);
	        });

	        this._waitEditor.resolve(this._editor);
	    },
	    setValue: function(value, language = 'javascript') {
	        if (!value && value !== 0) value = "";
	        if (this._editor) {
	            this._editor.setValue(value);
	            this._editor.getModel().updateOptions({ tabSize: 2 })
	            monaco.editor.setModelLanguage(this._editor.getModel(), language);
	            this._editor.getModel()._resetTokenizationState()
	        }
	    },
	    getValue: function() {
	        return this._editor ? this._editor.getValue() : '';
	    },
	    getEditor: function(waitEditor) {
	        return waitEditor ? this._waitEditor : this._editor;
	    }
	}, webix.ui.view);

	function all_modules() {
	    return new Promise((resolve, reject) => {
		    AnalevR.call({
				'function': 'module.all.owner', 
				'params': [],    
				'onSuccess': resolve, 
				'onFailed': (message) => {
					sweetAlert('Oops...', 'An error happened with message "' + message + '"', "error");
		        	reject(message);
				}, 
		    });
		});
	}

	function add_module(name, label) {
	    return new Promise((resolve, reject) => {
	    	// analev_call('module.add', [name, label], function(req_id, resp) {
		    //     resp = JSON.parse(resp);
		    //     if (resp.success) {
	     //    		resolve(resp.data);
		    //     } else {
		    //     	sweetAlert('Oops...', 'An error happened with message "' + resp.data + '"', "error");
		    //     	reject(resp.message);
		    //     }
		    // });

		    AnalevR.call({
				'function': 'module.add', 
				'params': [name, label],    
				'onSuccess': resolve, 
				'onFailed': (message) => {
					sweetAlert('Oops...', 'An error happened with message "' + message + '"', "error");
		        	reject(message);
				}, 
		    });
		});
	}

	function rename_module(id, name, label) {
	    return new Promise((resolve, reject) => {
	    	// analev_call('module.rename', [id, name, label], function(req_id, resp) {
		    //     resp = JSON.parse(resp);
		    //     if (resp.success) {
	     //    		resolve(resp.data);
		    //     } else {
		    //     	sweetAlert('Oops...', 'An error happened with message "' + resp.data + '"', "error");
		    //     	reject(resp.message);
		    //     }
		    // });

		    AnalevR.call({
				'function': 'module.rename', 
				'params': [id, name, label],    
				'onSuccess': resolve, 
				'onFailed': (message) => {
					sweetAlert('Oops...', 'An error happened with message "' + message + '"', "error");
		        	reject(message);
				}, 
		    });
		});
	}

	function remove_module(id) {
		return new Promise((resolve, reject) => {
			// analev_call('module.remove', [id], function(req_id, resp) {
		 //        resp = JSON.parse(resp);
		 //        if (resp.success) {
	  //       		resolve(resp.data);
		 //        } else {
		 //        	sweetAlert('Oops...', 'An error happened with message "' + resp.data + '"', "error");
		 //        	reject(resp.message);
		 //        }
		 //    });

		 	AnalevR.call({
				'function': 'module.remove', 
				'params': [id],    
				'onSuccess': resolve, 
				'onFailed': (message) => {
					sweetAlert('Oops...', 'An error happened with message "' + message + '"', "error");
		        	reject(message);
				}, 
		    });
		});
	}

	function list_module_files(module_id) {
		return new Promise((resolve, reject) => {
		    AnalevR.call({
				'function': 'module.files', 
				'params': [module_id],    
				'onSuccess': resolve, 
				'onFailed': (message) => {
					sweetAlert('Oops...', 'An error happened with message "' + message + '"', "error");
		        	reject(message);
				}, 
		    });
		});
	}

	function add_r_file(module_id, name) {
		return new Promise((resolve, reject) => {
			// analev_call('module.file.add.r', [module_id, name], function(req_id, resp) {
		 //        resp = JSON.parse(resp);
		 //        if (resp.success) {
	  //       		resolve(resp.data);
		 //        } else {
		 //        	sweetAlert('Oops...', 'An error happened with message "' + resp.data + '"', "error");
		 //        	reject(resp.message);
		 //        }
		 //    });

		 	AnalevR.call({
				'function': 'module.file.add.r', 
				'params': [module_id, name],    
				'onSuccess': resolve, 
				'onFailed': (message) => {
					sweetAlert('Oops...', 'An error happened with message "' + message + '"', "error");
		        	reject(message);
				}, 
		    });
		});
	}

	function rename_r_file(id, name) {
		return new Promise((resolve, reject) => {
			// analev_call('module.file.rename.r', [id, name], function(req_id, resp) {
		 //        resp = JSON.parse(resp);
		 //        if (resp.success) {
	  //       		resolve(resp.data);
		 //        } else {
		 //        	sweetAlert('Oops...', 'An error happened with message "' + resp.data + '"', "error");
		 //        	reject(resp.message);
		 //        }
		 //    });

		 	AnalevR.call({
				'function': 'module.file.rename.r', 
				'params': [id, name],    
				'onSuccess': resolve, 
				'onFailed': (message) => {
					sweetAlert('Oops...', 'An error happened with message "' + message + '"', "error");
		        	reject(message);
				}, 
		    });
		});
	}

	function read_ui_file(module_id) {
		return new Promise((resolve, reject) => {
			// analev_call('module.file.ui.read', [module_id], function(req_id, resp) {
		 //        resp = JSON.parse(resp);
		 //        if (resp.success) {
	  //       		resolve(resp.data);
		 //        } else {
		 //        	sweetAlert('Oops...', 'An error happened with message "' + resp.data + '"', "error");
		 //        	reject(resp.message);
		 //        }
		 //    });

		 	AnalevR.call({
				'function': 'module.file.ui.read', 
				'params': [module_id],    
				'onSuccess': resolve, 
				'onFailed': (message) => {
					sweetAlert('Oops...', 'An error happened with message "' + message + '"', "error");
		        	reject(message);
				}, 
		    });
		});
	}

	function read_file(id) {
		return new Promise((resolve, reject) => {
			// analev_call('module.file.id.read', [id], function(req_id, resp) {
		 //        resp = JSON.parse(resp);
		 //        if (resp.success) {
	  //       		resolve(resp.data);
		 //        } else {
		 //        	sweetAlert('Oops...', 'An error happened with message "' + resp.data + '"', "error");
		 //        	reject(resp.message);
		 //        }
		 //    });

		 	AnalevR.call({
				'function': 'module.file.id.read', 
				'params': [id],    
				'onSuccess': resolve, 
				'onFailed': (message) => {
					sweetAlert('Oops...', 'An error happened with message "' + message + '"', "error");
		        	reject(message);
				}, 
		    });
		});
	}

	function save_file(file_id, curr_code) {
		return new Promise((resolve, reject) => {
			// analev_call('module.file.save', [file_id, curr_code], function(_req_id, resp) {
   //              var resp = JSON.parse(resp);
   //              if (resp.success) {
   //                  $$('list_modules').updateItem(file_id, {
   //                      value: '{0}.{1}'.format(file.filename, file.extension),
   //                      content: curr_code,
   //                      remote_content: curr_code
   //                  });
   //              }
   //          });

		 	AnalevR.call({
				'function': 'module.file.save', 
				'params': [file_id, curr_code],    
				'onSuccess': resolve, 
				'onFailed': (message) => {
					sweetAlert('Oops...', 'An error happened with message "' + message + '"', "error");
		        	reject(message);
				}, 
		    });
		});
	}

	function remove_file(id) {
		return new Promise((resolve, reject) => {
			// analev_call('module.file.remove', [id], function(req_id, resp) {
		 //        resp = JSON.parse(resp);
		 //        if (resp.success) {
	  //       		resolve(resp.data);
		 //        } else {
		 //        	sweetAlert('Oops...', 'An error happened with message "' + resp.data + '"', "error");
		 //        	reject(resp.message);
		 //        }
		 //    });

		 	AnalevR.call({
				'function': 'module.file.remove', 
				'params': [id],    
				'onSuccess': resolve, 
				'onFailed': (message) => {
					sweetAlert('Oops...', 'An error happened with message "' + message + '"', "error");
		        	reject(message);
				}, 
		    });
		});
	}
</script>

<script type="text/javascript">
	$(function() {
	    window.webdis_url = '<?php echo $broker_url ?>';
	    window.session_id = '<?php echo $session->id ?>';
	    window.ext_lang_map = {
	        'js': 'javascript',
	        'r': 'r'
	    };

	    // Hide loading page indicator
	    $('.loading-modal').addClass('animated').css('z-index', -1);

	    webix.ui({
	        container: "main_content",
	        height: 500,
	        cols: [{
	                view: "tree",
	                id: 'list_modules',
	                width: 250,
	                data: [{
	                    id: "root",
	                    value: "Modules",
	                    open: true
	                }],
	                on: {
	                    onItemClick: function(id, e, node) {
	                        var item = this.getItem(id);

	                        if (item.$count == 0) {
	                            if ('content' in item) {
	                                this.select(id);
	                                $$('editor').setValue(item.content, window.ext_lang_map[item.extension.toLowerCase()]);
	                            }
	                        }
	                    }
	                }
	            },
	            {
	                view: "resizer"
	            },
	            {
	                rows: [{
	                    view: "toolbar",
	                    id: "editor_toolbar",
	                    cols: [{
	                        view: "button",
	                        id: 'editor_save_button', 
	                        value: "Save",
	                        width: 100,
	                        align: "right",
	                        click: () => {
	                            var file_id = $$('list_modules').getSelectedId();
	                            var file = $$('list_modules').getItem(file_id);
	                            var curr_code = $$('editor').getValue();

	                            save_file(file_id, curr_code).then((f) => {
	                            	$$('list_modules').updateItem(file_id, {
                                        value: '{0}.{1}'.format(f.filename, f.extension),
                                        content: curr_code,
                                        remote_content: curr_code
                                    });
	                            });
	                        }
	                    }, {
	                        view: "button",
	                        value: "Discard",
	                        width: 100,
	                        align: "right",
	                        click: () => {
	                            var file_id = $$('list_modules').getSelectedId();
	                            var file = $$('list_modules').getItem(file_id);

	                            $$('editor').setValue(file.remote_content, window.ext_lang_map[file.extension.toLowerCase()]);
	                        }
	                    }]
	                }, {
	                    view: "monaco-editor",
	                    id: 'editor',
	                    on: {
	                        'onChange': function(e) {
	                            var file_id = $$('list_modules').getSelectedId();
	                            var file = $$('list_modules').getItem(file_id);
	                            var curr_code = $$('editor').getValue();
	                            var changes = curr_code != file.remote_content;

	                            $$('list_modules').updateItem(file_id, {
	                                value: changes ? '{0}.{1}*'.format(file.filename, file.extension) : '{0}.{1}'.format(file.filename, file.extension),
	                                content: curr_code
	                            });
	                        }
	                    }
	                }]
	            }
	        ]
	    });

	    webix.ui({
	        view: "contextmenu",
	        id: "list_modules_menu",
	        data: [],
	        on: {
	            onBeforeShow: function() {
	                var tree_item = $$('list_modules').getItem(this.getContext().id);

	                this.clearAll();
	                if (tree_item.$level == 1) {
	                    this.add({ id: 'new_module', value: 'New Module' });
	                } else if (tree_item.$level == 2) {
	                    this.add({ id: 'rename_module', value: 'Rename Module' });
	                    this.add({ id: 'remove_module', value: 'Remove Module' });
	                    this.add({ id: 'new_r_file', value: 'New R File' });
	                } else if (tree_item.$level == 3 && tree_item.extension == 'R') {
	                    this.add({ id: 'rename_r_file', value: 'Rename R File' });
	                    this.add({ id: 'remove_r_file', value: 'Remove R File' });
	                }
	                this.render();
	            },
	            onItemClick: function(id) {
	            	var tree_item = $$('list_modules').getItem(this.getContext().id);

	                if (id == 'new_module') {
	                    webix.ui({
	                        view: "window",
	                        height: 200,
	                        width: 300,
	                        modal: true,
	                        position: "center",
	                        head: "Enter Module Name",
	                        body: {
	                            view: "form",
	                            elements: [
	                                { view: "text", name: "name", label: "Name" },
	                                { view: "text", name: "label", label: "Label" },
	                                {
	                                	cols: [
	                                		{
			                                    view: "button",
			                                    label: "Cancel",
			                                    click: function() {
			                                        this.getFormView().getParentView().hide();
			                                    }
			                                }, 
			                                {
			                                    view: "button",
			                                    label: "Save",
			                                    click: function() {
			                                    	var name = this.getFormView().elements["name"].getValue(), 
			                                    		label = this.getFormView().elements["label"].getValue();

			                                        add_module(name, label).then(d => {
			                                        	$$('list_modules').data.add({
										                    id: d.id,
										                    name: d.name, 
										                    label: d.label, 
										                    value: d.label,
										                    open: true,
										                }, -1, 'root');

										                // Load file(s) associated with each module
										                list_module_files(d.id).then(ds => {
										                	ds.forEach((d) => {
										                		$$('list_modules').data.add({
									                                id: d.id,
									                                value: '{0}.{1}'.format(d.filename, d.extension),
									                                filename: d.filename,
									                                extension: d.extension,
									                            }, -1, d.module_id);

										                		read_file(d.id).then(d => {
										                			$$('list_modules').updateItem(d.id, {
								                                        remote_content: d.content,
								                                        content: d.content
								                                    });
										                		});
										                	});

										                	this.getFormView().getParentView().hide();
										                });
			                                        });
			                                    }
			                                }
	                                	]
	                                }
	                            ]
	                        }
	                    }).show();
	                } else if (id == 'rename_module') {
	                    webix.ui({
	                        view: "window",
	                        height: 200,
	                        width: 300,
	                        modal: true,
	                        position: "center",
	                        head: "Enter New Module Name",
	                        body: {
	                            view: "form",
	                            elements: [
	                            	{ view: "text", name: "name", label: "Name", value: tree_item.name },
	                                { view: "text", name: "label", label: "Label", value: tree_item.label },
	                                {
	                                	cols: [
	                                		{
			                                    view: "button",
			                                    label: "Cancel",
			                                    click: function() {
			                                        this.getFormView().getParentView().hide();
			                                    }
			                                }, 
			                                {
			                                    view: "button",
			                                    label: "Save",
			                                    click: function() {
			                                    	var name = this.getFormView().elements["name"].getValue(), 
			                                    		label = this.getFormView().elements["label"].getValue();

			                                        rename_module(tree_item.id, name, label).then(d => {
			                                        	$$('list_modules').updateItem(d.id, {
		                                        			name: d.name, 
										                    label: d.label, 
										                    value: d.label
					                                    });

					                                    read_ui_file(d.id).then((d) => {
							                            	$$('list_modules').updateItem(d.id, {
							                            		value: '{0}.{1}'.format(d.filename, d.extension),
								                                filename: d.filename,
								                                extension: d.extension,
						                                        remote_content: d.content,
						                                        content: d.content
						                                    });

						                                    if (d.id == $$('list_modules').getSelectedId()) {
						                                    	$$('editor').setValue(d.content, window.ext_lang_map[d.extension.toLowerCase()]);
						                                    }

						                                    this.getFormView().getParentView().hide();
							                            });
			                                        });
			                                    }
			                                }
	                                	]
	                                }
	                            ]
	                        }
	                    }).show();
	                } else if (id == 'remove_module') {
	                	webix.confirm({
						    title: "Remove Module",
						    text: "Do you want to remove module " + tree_item.value + "?",
						    type:"confirm-warning",
						    callback:function(will_remove){
						        if (will_remove) {
						        	remove_module(tree_item.id).then((id) => {
						        		$$('list_modules').remove(id);
						        	});
						        }
						    }
						});
	                } else if (id == 'new_r_file') {
	                    webix.ui({
	                        view: "window",
	                        height: 200,
	                        width: 300,
	                        modal: true,
	                        position: "center",
	                        head: "Enter File Name (Without Extension)",
	                        body: {
	                            view: "form",
	                            elements: [
	                                { view: "text", name: "name", label: "Name" },
	                                {
	                                	cols: [
	                                		{
			                                    view: "button",
			                                    label: "Cancel",
			                                    click: function() {
			                                        this.getFormView().getParentView().hide();
			                                    }
			                                }, 
			                                {
			                                    view: "button",
			                                    label: "Save",
			                                    click: function() {
			                                    	var name = this.getFormView().elements["name"].getValue();

			                                    	add_r_file(tree_item.id, name).then((d) => {
			                                    		$$('list_modules').data.add({
							                                id: d.id,
							                                value: '{0}.{1}'.format(d.filename, d.extension),
							                                filename: d.filename,
							                                extension: d.extension,
							                            }, -1, d.module_id);

							                            read_file(d.id).then((d) => {
							                            	$$('list_modules').updateItem(d.id, {
						                                        remote_content: d.content,
						                                        content: d.content
						                                    });

						                                    this.getFormView().getParentView().hide();
							                            });
			                                    	});
			                                    }
			                                }
	                                	]
	                                }
	                            ]
	                        }
	                    }).show();
	                } else if (id == 'rename_r_file') {
	                    webix.ui({
	                        view: "window",
	                        height: 200,
	                        width: 300,
	                        modal: true,
	                        position: "center",
	                        head: "Enter New File Name (Without Extension)",
	                        body: {
	                            view: "form",
	                            elements: [
	                                { view: "text", name: "name", label: "Name", value: tree_item.filename },
	                                {
	                                	cols: [
	                                		{
			                                    view: "button",
			                                    label: "Cancel",
			                                    click: function() {
			                                        this.getFormView().getParentView().hide();
			                                    }
			                                }, 
			                                {
			                                    view: "button",
			                                    label: "Save",
			                                    click: function() {
			                                    	var name = this.getFormView().elements["name"].getValue();
			                                    	var is_saved = tree_item.content == tree_item.remote_content;

			                                    	var _save = () => {
			                                    		rename_r_file(tree_item.id, name).then((d) => {
				                                    		$$('list_modules').updateItem(d.id, {
								                                value: '{0}.{1}'.format(d.filename, d.extension),
								                                filename: d.filename
								                            });

								                            read_file(d.id).then((d) => {
								                            	$$('list_modules').updateItem(d.id, {
							                                        remote_content: d.content,
							                                        content: d.content
							                                    });

							                                    if ($$('list_modules').getSelectedId() == d.id) {
							                                    	$$('list_modules').callEvent('onItemClick', [d.id]);
							                                    }

							                                    this.getFormView().getParentView().hide();
								                            });
				                                    	});
			                                    	}

			                                    	if (!is_saved) {
			                                    		webix.confirm({
														    title: "Save File",
														    text: "File " + tree_item.value + " is unsaved. Do you want to save before renaming?",
														    type:"confirm-warning",
														    callback: (will_save) => {
														        if (will_save) {
														        	$$('editor_save_button').click();
														        	_save();
														        }
														    }
														});
			                                    	} else {
			                                    		_save()
			                                    	}
			                                    }
			                                }
	                                	]
	                                }
	                            ]
	                        }
	                    }).show();
	                } else if (id == 'remove_r_file') {
	                	webix.confirm({
						    title: "Remove File",
						    text: "Do you want to remove file " + tree_item.value + "?",
						    type:"confirm-warning",
						    callback:function(will_remove){
						        if (will_remove) {
						        	remove_file(tree_item.id).then((id) => {
						        		$$('list_modules').remove(id);

						        		if (id == $$('list_modules').getSelectedId()) {
	                                    	$$('editor').setValue('', 'r');
	                                    }
						        	});
						        }
						    }
						});
	                }
	            }
	        }
	    });

	    $$("list_modules_menu").attachTo($$("list_modules"));

	    // Load all module(s)
	    all_modules().then((modules) => {
            modules.forEach((d) => {
                $$('list_modules').data.add({
                    id: d.id,
                    name: d.name, 
                    label: d.label, 
                    value: d.label,
                    open: true,
                }, -1, 'root');

                list_module_files(d.id).then((files) => {
                	files.forEach((f) => {
                        $$('list_modules').data.add({
                            id: f.id,
                            value: '{0}.{1}'.format(f.filename, f.extension),
                            filename: f.filename,
                            extension: f.extension,
                        }, -1, f.module_id);

                        // Map filename to file_id
                        if (!('filename_fileid_map' in window)) window.filename_fileid_map = {};
                        window.filename_fileid_map[f.filename] = f.id;

                        read_file(f.id).then((c) => {
                        	$$('list_modules').updateItem(c.id, {
                                remote_content: c.content,
                                content: c.content
                            });
                        })
                	});
                })
        	});
        });
	});
</script>

<?php $this->load->view('templates/footer'); ?>