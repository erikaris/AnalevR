module.all <- function() {
    db <- database.mysql()
    rs <- dbSendQuery(db, 'SELECT m.id, m.name, m.label, m.owner AS owner_id, u.fullname AS owner_name FROM module_model m, user_model u WHERE m.owner = u.id')
    rows <- dbFetch(rs)
    dbClearResult(rs)

    for (i in 0:length(rows)-1) {
        db <- database.mysql()
        rs <- dbSendQuery(db, paste0('SELECT f.id, f.filename, f.extension FROM module_file_model f WHERE f.module_id="', rows$id[i], '"'))
        files <- dbFetch(rs)
        dbClearResult(rs)

        rows[i, 'files'] <- toJSON(files)
    }

    return(rows)
}

module.all.owner <- function() {
    db <- database.mysql()

    sess.id <- req.sess
    rs <- dbSendQuery(db, paste0('SELECT * FROM session_model WHERE id = "', sess.id, '"'))
    sess <- dbFetch(rs)
    dbClearResult(rs)

    rs <- dbSendQuery(db, paste0('SELECT m.id, m.name, m.label, m.owner AS owner_id, u.fullname AS owner_name FROM module_model m, user_model u WHERE m.owner = u.id AND u.id = "', sess$user_id, '"'))
    rows <- dbFetch(rs)
    dbClearResult(rs)

    return(rows)
}

module.add <- function(mod.name, mod.label) {
    library(uuid)

    db <- database.mysql()
    mod.id <- UUIDgenerate(use.time=TRUE)
    sess.id <- req.sess

    rs <- dbSendQuery(db, paste0('SELECT * FROM session_model WHERE id = "', sess.id, '"'))
    sess <- dbFetch(rs)
    dbClearResult(rs)

    # Create required module file(s)
    mod.loc <- file.path(module.dir, mod.id)    
    if (! dir.exists(mod.loc)) {
        dir.create(mod.loc, showWarnings = FALSE, recursive = TRUE)
    }

    ui.js.id <- UUIDgenerate(use.time=TRUE)
    ui.js <- file.path(mod.loc, paste0(ui.js.id, '.js'))
    cat(paste0("// ui.js\n \n window.", mod.name, " = class extends AR.BaseModule {\n constructor(props) {\n super(props);\n this.state = _.extend(this.state, { \nvariables: [], \n});\n }\n \ncomponentDidUpdate(prevProps, prevState) { \nif (!_.isEqual(prevState.dataset_id, this.state.dataset_id)) this.setState({dataset_changing: true}); \nif (this.state.dataset_changing) this.setState({variables: this.dataset().variables, dataset_changing: false}); \n} \n \nrender() { \nreturn React.createElement('div', { className: 'row' }, \nReact.createElement('div', { className: 'col-lg-4 col-md-4 col-sm-12 col-xs-12' }, \nReact.createElement(AR.FormGroup, { \ntitle: 'Dataset', \nhelp: 'Select dataset', \ntype: { \nclass: ReactBootstrap.SelectPicker, \nprops: { \nmultiple: false, \noptions: Object.values(this.datasets()).map((d) => { return {value: d.id, label: d.label} }), \nwidth: 'auto', \n'bs-events': { \nonLoaded: (ev) => { \nthis.setState({dataset_id: ev.target.value}); \n}, \nonChanged: (ev) => { \nthis.setState({dataset_id: ev.target.value}); \n} \n} \n} \n}, \n}), \n), \nReact.createElement('div', { className: 'col-lg-8 col-md-8 col-sm-12 col-xs-12' }, \nReact.createElement(ARCodeMirror, { title: 'Result', ref: (el) => this.result_ta = el }) \n) \n); \n}\n }"), file=ui.js, sep="\n")

    # Insert module
    dbGetQuery(db, paste0('INSERT INTO module_model (id, name, label, owner) VALUES("', mod.id, '", "', mod.name, '", "', mod.label, '", "', sess$user_id, '")'))

    # Insert file
    dbGetQuery(db, paste0('INSERT INTO module_file_model (id, module_id, filename, extension) VALUES("', ui.js.id, '", "', mod.id, '", "ui", "js")'))

    # Return newly created module
    rs <- dbSendQuery(db, paste0('SELECT * FROM module_model WHERE id = "', mod.id, '"'))
    mod <- dbFetch(rs)
    dbClearResult(rs)

    return(as.list(mod))
}

module.rename <- function(mod.id, mod.name, mod.label) {
    db <- database.mysql()
    mod.loc <- file.path(module.dir, mod.id) 

    # Get old module name
    rs <- dbSendQuery(db, paste0('SELECT name FROM module_model WHERE id = "', mod.id, '"'))
    rows <- dbFetch(rs, n=1)
    dbClearResult(rs)
    mod.name.old <- rows$name[1]

    # Update module
    dbGetQuery(db, paste0('UPDATE module_model SET name = "', mod.name, '", label = "', mod.label, '" WHERE id = "', mod.id, '"'))

    # Update content
    rs <- dbSendQuery(db, paste0('SELECT id FROM module_file_model WHERE module_id = "', mod.id, '" AND filename = "ui"'))
    rows <- dbFetch(rs, n=1)
    dbClearResult(rs)

    ui.js.id <- rows$id[1]
    f <- file.path(mod.loc, paste0(ui.js.id, '.js'))
    x <- readLines(f)
    y <- gsub(mod.name.old, mod.name, x)
    cat(y, file=f, sep="\n")

    # Return newly modified module
    rs <- dbSendQuery(db, paste0('SELECT * FROM module_model WHERE id = "', mod.id, '"'))
    mod <- dbFetch(rs)
    dbClearResult(rs)

    return(as.list(mod))
}

module.remove <- function(mod.id) {
    db <- database.mysql()
    dbGetQuery(db, paste0('DELETE FROM module_file_model WHERE module_id = "', mod.id, '"'))
    dbGetQuery(db, paste0('DELETE FROM module_model WHERE id = "', mod.id, '"'))

    return(mod.id)
}

module.files <- function(id) {
    db <- database.mysql()
    rs <- dbSendQuery(db, paste0('SELECT id, module_id, filename, extension FROM module_file_model WHERE module_id = "', id, '"'))
    rows <- dbFetch(rs)
    dbClearResult(rs)

    return(rows)
}

module.file.add.r <- function(mod.id, file.name) {
    library(uuid)

    db <- database.mysql()

    # Create required module file(s)
    mod.loc <- file.path(module.dir, mod.id)    
    if (! dir.exists(mod.loc)) {
        dir.create(mod.loc, showWarnings = FALSE, recursive = TRUE)
    }

    ui.r.id <- UUIDgenerate(use.time=TRUE)
    ui.r <- file.path(mod.loc, paste0(ui.r.id, '.R'))
    cat(paste0("# ", file.name, ".R \n\nfn.", file.name, " <- function() { \n\n} \n\nfn.", file.name, "()"), file=ui.r, sep="\n")

    # Insert file
    dbGetQuery(db, paste0('INSERT INTO module_file_model (id, module_id, filename, extension) VALUES("', ui.r.id, '", "', mod.id, '", "', file.name, '", "R")'))

    # Return newly created file
    rs <- dbSendQuery(db, paste0('SELECT * FROM module_file_model WHERE id = "', ui.r.id, '"'))
    file <- dbFetch(rs)
    dbClearResult(rs)

    return(as.list(file))
}

module.file.rename.r <- function(file.id, file.name) {
    library(uuid)

    db <- database.mysql()

    # Get old file
    rs <- dbSendQuery(db, paste0('SELECT * FROM module_file_model WHERE id = "', file.id, '"'))
    file <- dbFetch(rs)
    dbClearResult(rs)

    # Update content
    f <- file.path(module.dir, file$module_id, paste0(file$id, '.', file$extension))
    x <- readLines(f)
    y <- gsub(paste0(file$filename, '.', file$extension), paste0(file.name, '.', file$extension), x)
    cat(y, file=f, sep="\n")

    # Update file
    dbGetQuery(db, paste0('UPDATE module_file_model SET filename = "', file.name, '" WHERE id = "', file.id, '"'))

    # Return newly created file
    rs <- dbSendQuery(db, paste0('SELECT * FROM module_file_model WHERE id = "', file.id, '"'))
    file <- dbFetch(rs)
    dbClearResult(rs)

    return(as.list(file))
}

# deprecated
module.file.read <- function(mod.id, file.name) {
    library(readr)

    mod.loc <- file.path(module.dir, mod.id, file.name)
    return(read_file(mod.loc))
}

module.file.id.read <- function(file.id) {
    library(readr)

    db <- database.mysql()
    rs <- dbSendQuery(db, paste0('SELECT id, module_id, extension FROM module_file_model WHERE id = "', file.id, '"'))
    rows <- dbFetch(rs, n=1)
    dbClearResult(rs)

    file.loc <- file.path(module.dir, rows$module_id[1], paste0(rows$id[1], '.', rows$extension[1]))
    return(list('id'=rows$id[1], 'filename'=rows$filename[1], 'extension'=rows$extension[1], 'content'=read_file(file.loc)))
}

module.file.ui.read <- function(mod.id) {
    library(readr)

    db <- database.mysql()
    rs <- dbSendQuery(db, paste0('SELECT id, module_id, filename, extension FROM module_file_model WHERE module_id = "', mod.id, '" AND filename = "ui"'))
    rows <- dbFetch(rs, n=1)
    dbClearResult(rs)

    file.loc <- file.path(module.dir, mod.id, paste0(rows$id[1], '.', rows$extension[1]))
    return(list('id'=rows$id[1], 'filename'=rows$filename[1], 'extension'=rows$extension[1], 'content'=read_file(file.loc)))
}

module.file.remove <- function(file.id) {
    db <- database.mysql()
    dbGetQuery(db, paste0('DELETE FROM module_file_model WHERE id = "', file.id, '"'))

    return(file.id)
}

module.file.name.read <- function(file.name) {
    library(readr)

    db <- database.mysql()
    rs <- dbSendQuery(db, paste0('SELECT id, module_id, extension FROM module_file_model WHERE filename = "', file.name, '"'))
    row <- dbFetch(rs)
    dbClearResult(rs)

    file.loc <- file.path(module.dir, row$module_id, paste0(row$id, '.', row$extension))
    return(read_file(file.loc))
}

module.file.save <- function(file.id, content) {
    db <- database.mysql()
    rs <- dbSendQuery(db, paste0('SELECT id, module_id, extension FROM module_file_model WHERE id = "', file.id, '"'))
    row <- dbFetch(rs)
    dbClearResult(rs)

    file.loc <- file.path(module.dir, row$module_id, paste0(row$id, '.', row$extension))
    cat(content, file=file.loc, sep="\n")
}

module.file.id.eval <- function(file.id, format.params) {
    library(readr)
    library(stringr)

    db <- database.mysql()
    rs <- dbSendQuery(db, paste0('SELECT id, module_id, extension FROM module_file_model WHERE id = "', file.id, '"'))
    row <- dbFetch(rs)
    dbClearResult(rs)

    file.loc <- file.path(module.dir, row$module_id, paste0(row$id, '.', row$extension))

    # file.content <- read_file(file.loc)
    # file.content <- gsub(pattern = "#[^\\\n]*", replacement = "", x = read_file(file.loc))
    file.lines <- read_lines(file=file.loc)
    fn <- function(x) gsub(pattern = "#[^*]*", replacement = "", x = x)
    file.content <- paste(sapply(file.lines, fn), collapse="\n")

    for (name in names(format.params)) {
        file.content <- str_replace_all(file.content, paste0('\\{', name, '\\}'), format.params[[name]])
    }

    # return(file.content)

    # conn$LPUSH("log", paste(script.name(), paste0("[", req.sess, "]"), "-", paste0("Executing command...\n")))
    conn$LPUSH(paste0("worker-req"), toJSON(list(sess=req.sess, 'id'=req.id, 'cmd'=file.content)))
    return(as.logical(0))
}

module.file.name.eval <- function(file.name, format.params) {
    library(readr)
    library(stringr)

    db <- database.mysql()
    rs <- dbSendQuery(db, paste0('SELECT id, module_id, extension FROM module_file_model WHERE filename = "', file.name, '"'))
    row <- dbFetch(rs)
    dbClearResult(rs)

    file.loc <- file.path(module.dir, row$module_id, paste0(row$id, '.', row$extension))

    # file.content <- read_file(file.loc)
    # file.content <- gsub(pattern = "#[^\\\n]*", replacement = "", x = read_file(file.loc))
    file.lines <- read_lines(file=file.loc)
    fn <- function(x) gsub(pattern = "#[^*]*", replacement = "", x = x)
    file.content <- paste(sapply(file.lines, fn), collapse="\n")

    for (name in names(format.params)) {
        file.content <- str_replace_all(file.content, paste0('\\{', name, '\\}'), format.params[[name]])
    }

    # return(file.content)

    # conn$LPUSH("log", paste(script.name(), paste0("[", req.sess, "]"), "-", paste0("Executing command...\n")))
    conn$LPUSH(paste0("worker-req"), toJSON(list(sess=req.sess, 'id'=req.id, 'cmd'=file.content)))
    return(as.logical(0))
}

# will be deprecated
module.read <- function(mod.id) {
    library(readr)

    db <- database.mysql()
    rs <- dbSendQuery(db, paste0('SELECT location FROM module_model WHERE id = "', mod.id, '"'))
    row <- dbFetch(rs)
    dbClearResult(rs)

    mod.loc <- file.path(module.dir, row$location)
    return(read_file(mod.loc))
}