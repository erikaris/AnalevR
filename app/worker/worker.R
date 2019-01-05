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
library(stringr)
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
    inp.arr <- conn$BRPOP("req", 5)

    tryCatch({
	    str.inp.req <- inp.arr[[2]]
	    if (is.null(str.inp.req)) {
	    	idle.iteration <<- idle.iteration + 1
	    	conn$LPUSH("log", paste("worker.R", paste0("[", pid, "]"), "-", 
	    		paste("Idle iteration", idle.iteration, "of", max.idle.iteration)))
    	} else {
    		idle.iteration <<- 0

	    	conn$SET(paste0(host.name, ".worker.pid.", pid, ".processing"), TRUE)

	    	inp.req <- fromJSON(str.inp.req)
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

			worker.session.rdata.need.to.be.written <- FALSE
			worker.session.rdata.name <- paste0(req.id, '.session')
			data.file <- file.path(session.dir, 'session.json')

			session.save <- function(data.json) {
			    cat(data.json, file=data.file, sep="\n")
			}

			session.read <- function() {
			    if (file.exists(data.file)) {
			        data.json <- read_file(data.file)
			        return(data.json)
			    }

			    return("")
			}

			session.log <- function(str.log) {
				conn$LPUSH(paste0("log.", req.id), str.log)
			}

			log <- function(str.log) {
				conn$LPUSH(paste0("log.", req.id), str.log)
			}

			working.env <- new.env()
			working.env$req.sess = req.sess
			working.env$req.id = req.id
			working.env$conn = conn

			# Processing
	        err.code <- 0
	        resp.str <- 'Failed';

	        tryCatch({

	            if (! is.null(req.cmd)) {
	                conn$LPUSH("log", paste("worker.R", paste0("[", pid, "]"), paste0("[", req.sess, "]"), "-", 
	                	"Executing command", paste(capture.output(req.cmd), sep="")))

	                files <- list.files(path = session.dir, pattern = "\\.Rds$", full.names = TRUE)
	                envars <- lapply(lapply(files, readRDS), as.list)
	                for (vars in envars) list2env(vars, working.env)

	                worker.session.rdata.need.to.be.written <<- TRUE
    				worker.session.rdata.name <<- 'session'

	                # eval(parse(text='png(file="tmp.png")'))

	                if (grepl('ggplot', req.cmd, fixed=TRUE)) {
	                    req.cmd <<- paste0(req.cmd, '\n', 'ggsave(".tmp.png")')
	                }

	                resp.obj <<- eval(parse(text=req.cmd), envir=working.env)

	                # eval(parse(text='dev.off()'), envir=working.env)

	                resp.obj <<- process.response(resp.obj, err.code)
	            }

	            else if (! is.null(req.func)) {
	                conn$LPUSH("log", paste("worker.R", paste0("[", pid, "]"), paste0("[", req.sess, "]"), "-", 
	                	"Calling function", paste0("\"", req.func, "\""), "..."))

	                resp.obj <<- do.call(req.func, as.list(req.args), envir=working.env)

	                if(is.logical(resp.obj)) {
	                    if (resp.obj == FALSE) next
	                }
	            }

	            # Save session for next purpose
				if(worker.session.rdata.need.to.be.written) {
					worker.session.rdata <- file.path(session.dir, paste0(worker.session.rdata.name, '.Rds'))
					worker.session.rdata.locked <- file.path(session.dir, paste0(worker.session.rdata.name, '.lRds'))

					conn$LPUSH("log", paste("worker.R", paste0("[", pid, "]"), paste0("[", req.sess, "]"), "-", 
		        		"Saving workspace to", worker.session.rdata))

					saveRDS(working.env, file=worker.session.rdata.locked, compress=FALSE)
					file.rename(worker.session.rdata.locked, worker.session.rdata)
				}

				rm(working.env)
				gc()

	        }, error = function(e) {
	            err.code <<- 1
	            resp.obj <<- capture.output(e)
	            
	            conn$LPUSH("log", paste("worker.R", paste0("[", pid, "]"), paste0("[", req.sess, "]"), "-", 
	            	"Error :", capture.output(e)))
			})

	        resp.str <- toJSON(list('session'=req.sess, 'id'=req.id, 'data'=resp.obj, 'success'=as.logical(1-err.code)), auto_unbox=TRUE, force=TRUE)
	        conn$LPUSH(paste0("resp-", req.id), resp.str)
	    }
    }, error = function(e) {        
        conn$LPUSH("log", paste("worker.R", paste0("[", pid, "]"), paste0("[", req.sess, "]"), "-", 
        	"Error :", capture.output(e)))
    })

    conn$SET(paste0(host.name, ".worker.pid.", pid, ".processing"), FALSE)
}