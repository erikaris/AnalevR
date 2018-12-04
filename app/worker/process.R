app.dir <- Sys.getenv('APP_DIR', '/app')
app.dir <- normalizePath(app.dir)
max.worker <- as.integer(Sys.getenv('MAX_WORKER', 10))

library(redux)
library(processx)
source(file.path(app.dir, 'util.R'))

conn <- redux::hiredis()

while(1) {
	n.worker <- as.integer(conn$LLEN("worker.pids"))
	if (n.worker > 0) {
		alive.worker.pids <- c()

		while(1) {
			worker.pid <- conn$RPOP("worker.pids")
			if (! is.null(worker.pid)) {
				if (processx:::process__exists(as.integer(worker.pid))) {
					alive.worker.pids <- c(alive.worker.pids, as.integer(worker.pid))
				}
			} else {
				break
			}
		}

		for (pid in alive.worker.pids) conn$LPUSH("worker.pids", pid)
		n.worker <- as.integer(conn$LLEN("worker.pids"))
	}

	workers.tobe.spawned <- max.worker - n.worker
	if (workers.tobe.spawned > 0) {
		for (i in 1:workers.tobe.spawned) {
			process$new(Rscript_binary(), c(file.path(app.dir, 'worker.R')))
		}
	}

	Sys.sleep(10)
}