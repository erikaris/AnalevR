app.dir <- Sys.getenv('APP_DIR', '/app')
app.dir <- normalizePath(app.dir)
# max.worker <- as.integer(Sys.getenv('MAX_WORKER', 10))

library(redux)
library(processx)
source(file.path(app.dir, 'util.R'))

conn <- redux::hiredis()
host.name <- Sys.info()[['nodename']]

while(1) {
	idle.worker.pids <- c()

	# Check whether workers are alive
	n.worker <- as.integer(conn$LLEN(paste0(host.name, ".worker.pids")))
	if (n.worker > 0) {
		alive.worker.pids <- c()

		while(1) {
			worker.pid <- conn$RPOP(paste0(host.name, ".worker.pids"))
			if (! is.null(worker.pid)) {
				if (processx:::process__exists(as.integer(worker.pid))) {
					alive.worker.pids <- c(alive.worker.pids, as.integer(worker.pid))

					is.processing <- conn$GET(paste0(host.name, ".worker.pid.", worker.pid, ".processing"))
					if (is.null(is.processing)) is.processing <- TRUE
					else if (as.integer(is.processing) == 0) is.processing <- FALSE
					else if (as.integer(is.processing) == 1) is.processing <- TRUE

					if (! is.processing) {
						idle.worker.pids <- c(idle.worker.pids, as.integer(worker.pid))
					}
				}
			} else {
				break
			}
		}

		for (pid in alive.worker.pids) conn$LPUSH(paste0(host.name, ".worker.pids"), pid)
		# n.worker <- as.integer(conn$LLEN("worker.pids"))
		n.worker <- length(alive.worker.pids)
	}

	# workers.tobe.spawned <- max.worker - n.worker
	# if (workers.tobe.spawned > 0) {
	# 	for (i in 1:workers.tobe.spawned) {
	# 		process$new(Rscript_binary(), c(file.path(app.dir, 'worker.R')))
	# 	}
	# }

	# If there is no idle worker, then spawn another one
	if (length(idle.worker.pids) == 0) {
		process$new(Rscript_binary(), c(file.path(app.dir, 'worker.R')))
	}

	Sys.sleep(5)
}