app.dir <- Sys.getenv('APP_DIR', '/app')
app.dir <- normalizePath(app.dir)
module.dir <- Sys.getenv('MODULE_DIR', '/module')
module.dir <- normalizePath(module.dir)
workspace.dir <- Sys.getenv('WORKSPACE_DIR', '/workspace')
workspace.dir <- normalizePath(workspace.dir)
max.idle.iteration <- as.integer(Sys.getenv('AUTOKILL_AFTER_ITERATION', 20))

library(processx)
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
    inp.arr <- conn$BRPOP("req", 5)

    tryCatch({
	    str.inp.req <- inp.arr[[2]]
	    if (is.null(str.inp.req)) {
	    	idle.iteration <<- idle.iteration + 1
	    	conn$LPUSH("log", paste("worker.R", paste0("[", pid, "]"), "-", paste("Idle iteration", idle.iteration, "of", max.idle.iteration)))
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

			session.rdata <- file.path(session.dir, 'session.Rds')
			data.file <- file.path(session.dir, 'session.json')
			lock.file <- file.path(session.dir, 'session.lock')

			session.save <- function(data.json) {
			    cat(data.json, file=file.path(session.dir, 'session.json'), sep="\n")
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

			if (file.exists(lock.file)) {
				tryCatch({
					node.pid.lock <- read_file(lock.file)				
					node.pid <- unlist(strsplit(node.pid.lock, ":"))
					if (node.pid[1] == host.name) {
						if (! processx:::process__exists(as.integer(node.pid[2]))) {
							file.remove(lock.file)
						}
					}
				}, error = function(e) {
					conn$LPUSH("log", paste("worker.R", paste0("[", pid, "]"), paste0("[", req.sess, "]"), "-", "Error :", capture.output(e)))
				})

				Sys.sleep(1)
				conn$LPUSH("req", str.inp.req)
			} else {
				tryCatch({
					working.env <- new.env()
					if (file.exists(session.rdata)) {
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
			                conn$LPUSH("log", paste("worker.R", paste0("[", pid, "]"), paste0("[", req.sess, "]"), "-", "Executing command", paste(capture.output(req.cmd), sep="")))

			                # Put lock in session to avoid multiple process write same Rds in same time
    						cat(paste0(host.name, ":", pid), file=lock.file, sep="")

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
			                conn$LPUSH("log", paste("worker.R", paste0("[", pid, "]"), paste0("[", req.sess, "]"), "-", "Calling function", paste0("\"", req.func, "\""), "..."))

			                resp.obj <<- do.call(req.func, as.list(req.args), envir=working.env)

			                if(is.logical(resp.obj)) {
			                    if (resp.obj == FALSE) next
			                }
			            }

			        }, error = function(e) {
			            err.code <<- 1
			            resp.obj <<- capture.output(e)
			            
			            conn$LPUSH("log", paste("worker.R", paste0("[", pid, "]"), paste0("[", req.sess, "]"), "-", "Error :", resp.obj))
			        })

			        resp.str <- toJSON(list('session'=req.sess, 'id'=req.id, 'data'=resp.obj, 'success'=as.logical(1-err.code)), auto_unbox=TRUE, force=TRUE)
			        conn$LPUSH(paste0("resp-", req.id), resp.str)
				}, error = function(e) {
					conn$LPUSH("log", paste("worker.R", paste0("[", pid, "]"), paste0("[", req.sess, "]"), "-", "Error :", capture.output(e)))
					conn$LPUSH("req", str.inp.req)
				})

				# Save session for next purpose
		        conn$LPUSH("log", paste("worker.R", paste0("[", pid, "]"), paste0("[", req.sess, "]"), "-", "Saving workspace to", session.rdata))

		        if (file.exists(lock.file)) {
					tryCatch({
						node.pid.lock <- read_file(lock.file)				
						node.pid <- unlist(strsplit(node.pid.lock, ":"))
						if (node.pid[1] == host.name) {
							if (pid == as.integer(node.pid[2])) {
								saveRDS(working.env, file=session.rdata, compress=FALSE)
								file.remove(lock.file)
							}
						}
					}, error = function(e) {
						conn$LPUSH("log", paste("worker.R", paste0("[", pid, "]"), paste0("[", req.sess, "]"), "-", "Error :", capture.output(e)))
					})
				} else {
					saveRDS(working.env, file=session.rdata, compress=FALSE)
				}
	        }
	    }
    }, error = function(e) {        
        conn$LPUSH("log", capture.output(e))
    })

    conn$SET(paste0(host.name, ".worker.pid.", pid, ".processing"), FALSE)
}