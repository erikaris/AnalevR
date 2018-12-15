app.dir <- Sys.getenv('APP_DIR', '/app')
app.dir <- normalizePath(app.dir)
module.dir <- Sys.getenv('MODULE_DIR', '/module')
module.dir <- normalizePath(module.dir)
workspace.dir <- Sys.getenv('WORKSPACE_DIR', '/workspace')
workspace.dir <- normalizePath(workspace.dir)
max.idle.iteration <- as.integer(Sys.getenv('AUTOKILL_AFTER_ITERATION', 20))

library(redux)
library(jsonlite)
library(foreign)
library(readxl)
library(readr)
source(file.path(app.dir, 'util.R'))
source(file.path(app.dir, 'converter.R'))
file.sources = list.files(c(file.path(app.dir, 'rpc_helper')), pattern="*.R$", full.names=TRUE, ignore.case=TRUE)
sapply(file.sources, source, .GlobalEnv)

conn <- redux::hiredis()
host.name <- Sys.info()[['nodename']]

pid <- Sys.getpid()
conn$LPUSH("log", paste("New worker spawned with pid", pid))
conn$LPUSH(paste0(host.name, ".worker.pids"), pid)

idle.iteration <- 0

while(idle.iteration < max.idle.iteration) {
	# Capture input
    inp.arr <- conn$BRPOP("worker-req", 5)

    tryCatch({
	    inp.req <- inp.arr[[2]]
	    if (is.null(inp.req)) {
	    	idle.iteration <<- idle.iteration + 1
    	} else {
    		idle.iteration <<- 0

	    	conn$SET(paste0(host.name, ".worker.pid.", pid, ".processing"), TRUE)

	    	inp.req <- fromJSON(inp.req)
	    	req.sess <- inp.req$sess
	        req.id <- inp.req$id
	        req.cmd <- inp.req$cmd
	        req.func <- inp.req$func
	        req.args <- inp.req$args

	        # Session properties
			session.dir <- file.path(workspace.dir, req.sess)
			if (! dir.exists(session.dir)) {
			    dir.create(session.dir, showWarnings = FALSE, recursive = TRUE)
			}

			session.save <- function(data.json) {
			    cat(data.json, file=file.path(session.dir, 'session.json'), sep="\n")
			}

			session.read <- function() {
			    data.file <- file.path(session.dir, 'session.json')
			    if (file.exists(data.file)) {
			        data.json <- read_file(data.file)
			        return(data.json)
			    }

			    return("")
			}

			working.env <- new.env()

			session.rdata <- file.path(session.dir, 'session.Rds')
			if (file.exists(session.rdata)) {
				# e <- new.env()
				# load(file=session.rdata, envir = e)
				# working.env <<- e$working.env
				working.env <<- readRDS(session.rdata)
			}

			working.env$req.sess = req.sess
			working.env$req.id = req.id
			working.env$conn = conn

			# Processing
	        err.code <- 0
	        resp.str <- 'Failed';

	        tryCatch({

	            if (! is.null(req.cmd)) {
	                conn$LPUSH("log", paste(script.name(), paste0("[", req.sess, "]"), "-", "Executing command", paste(capture.output(req.cmd), sep="")))

	                # eval(parse(text='png(file="tmp.png")'))

	                if (grepl('ggplot', req.cmd, fixed=TRUE)) {
	                    req.cmd <<- paste0(req.cmd, '\n', 'ggsave(".tmp.png")')
	                }

	                resp.obj <<- eval(parse(text=req.cmd), envir=working.env)

	                # eval(parse(text='dev.off()'), envir=working.env)

	                # conn$LPUSH("log", paste(capture.output(resp.obj), collapse = '\n'))
	                resp.obj <<- process.response(resp.obj, err.code)
	            }

	            else if (! is.null(req.func)) {
	                conn$LPUSH("log", paste(script.name(), paste0("[", req.sess, "]"), "-", "Calling function", paste0("\"", req.func, "\""), "..."))

	                resp.obj <<- do.call(req.func, as.list(req.args), envir=working.env)

	                if(is.logical(resp.obj)) {
	                    if (resp.obj == FALSE) next
	                }
	            }

	            # Save session for next purpose
		        conn$LPUSH("log", paste(script.name(), paste0("[", req.sess, "]"), "-", "Saving workspace to", session.rdata))
		        # save(working.env, file = session.rdata)
		        saveRDS(working.env, file=session.rdata, compress=FALSE)

	        }, error = function(e) {
	            err.code <<- 1
	            resp.obj <<- capture.output(e)
	            
	            conn$LPUSH("log", paste(script.name(), paste0("[", req.sess, "]"), "-", "Error :", resp.obj))
	        })

	        resp.str <- toJSON(list('session'=req.sess, 'id'=req.id, 'data'=resp.obj, 'success'=as.logical(1-err.code)), auto_unbox=TRUE, force=TRUE)
	        conn$LPUSH(paste0("resp-", req.id), resp.str)
	    }
    }, error = function(e) {        
        conn$LPUSH("log", capture.output("error"))
    })

    conn$SET(paste0(host.name, ".worker.pid.", pid, ".processing"), FALSE)
}